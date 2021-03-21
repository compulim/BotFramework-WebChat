/// <reference path="../external/simple-update-in.d.ts" />

import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import { WebChatActivity } from '../types/WebChatActivity';
import { WebChatDeliveryReports } from '../types/WebChatDeliveryReports';

import createDebug from '../util/debug';
import DeliveryReportsContext from '../context/DeliveryReportsContext';
import getActivityKey from '../util/getActivityKey';
import styleConsole from '../util/styleConsole';
import useACSSendMessageWithClientMessageId from '../hooks/useACSSendMessageWithClientMessageId';
import useActivities2 from '../hooks/useActivities2';

let debug;

function generateTrackingNumber(): string {
  return `t-${random().toString(36).substr(2, 10)}`;
}

function useForceRender(): () => void {
  const [_, setState] = useState<void>();

  return useCallback(() => setState(() => {}), [setState]);
}

const DeliveryReportsComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<DeliveryReportsComposer>', { backgroundColor: 'orange', color: 'white' }));

  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const [activities] = useActivities2();
  const acsSendMessageWithClientMessageId = useACSSendMessageWithClientMessageId();
  const clientMessageIdsPendingActivitiesRef = useRef<{ [clientMessageId: string]: string }>({});
  const deliveryReportsRef = useRef<WebChatDeliveryReports>({});
  const forceRender = useForceRender();

  // Perf: decouple from callbacks
  const activitiesForCallbacksRef = useRef<WebChatActivity[]>();

  activitiesForCallbacksRef.current = activities;

  const populateDeliveryReportsWithActivities = useCallback(() => {
    let { current: nextDeliveryReports } = deliveryReportsRef;

    Object.entries(clientMessageIdsPendingActivitiesRef.current).forEach(([clientMessageId, trackingNumber]) => {
      const activity = activitiesForCallbacksRef.current.find(
        activity => activity.channelData['acs:client-message-id'] === clientMessageId
      );

      if (activity) {
        delete clientMessageIdsPendingActivitiesRef.current[clientMessageId];

        nextDeliveryReports = updateIn(nextDeliveryReports, [trackingNumber], report => ({
          ...report,
          activityKey: getActivityKey(activity),
          status: 'sent'
        }));

        nextDeliveryReports = updateIn(nextDeliveryReports, [trackingNumber, 'activityKey'], () =>
          getActivityKey(activity)
        );

        debug(
          [`Got delivery reports for message %c${activity.text}%c`, ...styleConsole('purple')],
          [{ activity, clientMessageId, trackingNumber }]
        );
      }
    });

    if (nextDeliveryReports !== deliveryReportsRef.current) {
      deliveryReportsRef.current = nextDeliveryReports;
      forceRender();

      const numPendings = Object.keys(clientMessageIdsPendingActivitiesRef.current).length;

      if (numPendings) {
        debug([
          `Delivery reports updated, %c${numPendings} messages%c are still %cpending%c`,
          ...styleConsole('purple'),
          ...styleConsole('red')
        ]);
      } else {
        debug('Delivery reports updated, %cno pending reports%c.', ...styleConsole('green'));
      }
    }
  }, [activitiesForCallbacksRef, deliveryReportsRef]);

  const sendMessageWithTrackingNumber = useCallback(
    (message: string) => {
      const trackingNumber = generateTrackingNumber();

      deliveryReportsRef.current[trackingNumber] = { status: 'sending' };

      (async function () {
        const clientMessageId = await acsSendMessageWithClientMessageId(message);

        if (!abortController.signal.aborted) {
          clientMessageIdsPendingActivitiesRef.current[clientMessageId] = trackingNumber;
          populateDeliveryReportsWithActivities();
        }
      })();

      return trackingNumber;
    },
    [acsSendMessageWithClientMessageId, deliveryReportsRef]
  );

  // If "activities" is updated, see if we can populate more delivery reports.
  useMemo(() => populateDeliveryReportsWithActivities(), [activities, populateDeliveryReportsWithActivities]);

  const { current: deliveryReports } = deliveryReportsRef;

  const context = useMemo(() => ({ deliveryReports, sendMessageWithTrackingNumber }), [
    deliveryReports,
    sendMessageWithTrackingNumber
  ]);

  return <DeliveryReportsContext.Provider value={context}>{children}</DeliveryReportsContext.Provider>;
};

DeliveryReportsComposer.defaultProps = {
  children: undefined
};

DeliveryReportsComposer.propTypes = {
  children: PropTypes.any
};

export default DeliveryReportsComposer;
