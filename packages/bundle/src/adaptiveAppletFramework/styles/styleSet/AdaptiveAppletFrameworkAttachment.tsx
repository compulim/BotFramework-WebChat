export default function () {
  // This is partial from "node_modules/adaptivecards/lib/adaptivecards.css"
  return {
    '&.webchat__adaptive-applet-framework': {
      /* Applet styles */

      '& .aaf-progress-overlay': {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },

      '@keyframes aaf-spinner-rotate': {
        from: { transform: 'rotate(0)' },
        to: { transform: 'rotate(360deg)' }
      },

      '& .aaf-spinner': {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        borderWidth: 1.5,
        borderStyle: 'solid',
        borderColor: 'rgb(0, 120, 212) rgb(199, 224, 244) rgb(199, 224, 244) rgb(199, 224, 244)',
        animationName: 'aaf-spinner-rotate',
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'cubic-bezier(0.53, 0.21, 0.29, 0.67)'
      },

      '& .aaf-cardHost': {},

      '& .aaf-refreshButtonHost': {
        borderTop: '1px solid #F1F1F1'
      }
    }
  };
}
