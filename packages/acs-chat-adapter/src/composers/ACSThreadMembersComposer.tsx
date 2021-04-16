// import { useFetchThreadMembers } from '@azure/acs-ui-sdk';
// import { useThreadMembers } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';
// import PropTypes from 'prop-types';
// import React, { FC, useEffect } from 'react';

// import ACSChatThreadMember from '../types/ACSChatThreadMember';
// import ACSThreadMembersContext from '../contexts/ACSThreadMembersContext';
// import useMapper from '../hooks/useMapper';

// let EMPTY_ARRAY;
// let PASSTHRU_FN;

// const ACSThreadMembersComposer: FC = ({ children }) => {
//   EMPTY_ARRAY || (EMPTY_ARRAY = []);
//   PASSTHRU_FN || (PASSTHRU_FN = value => value);

//   // This helper is needed because:
//   // - If fetchThreadMembers() is not called at least once, useThreadMembers() will always return empty array.

//   // Even fetchThreadMembers() is called, useThreadMembers() will not continue to update.

//   // TODO: On ACS SDK, there are no useSubscribeThreadMembers() hooks.
//   const fetchThreadMembers = useFetchThreadMembers();

//   // listParticipants

//   useEffect(() => {
//     fetchThreadMembers();
//   }, [fetchThreadMembers]);

//   const result = useThreadMembers();

//   const threadMembers = useMapper<ACSChatThreadMember, ACSChatThreadMember>(
//     result && result.length ? result : EMPTY_ARRAY,
//     PASSTHRU_FN
//   );

//   return <ACSThreadMembersContext.Provider value={threadMembers}>{children}</ACSThreadMembersContext.Provider>;
// };

// ACSThreadMembersComposer.defaultProps = {
//   children: undefined
// };

// ACSThreadMembersComposer.propTypes = {
//   children: PropTypes.any
// };

// export default ACSThreadMembersComposer;
