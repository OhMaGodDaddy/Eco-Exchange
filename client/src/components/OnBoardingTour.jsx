import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

const OnboardingTour = ({ runTour, setRunTour }) => {
  // Define where the tour points and what it says
  const steps = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to EcoExchange! 🌿',
      content: 'Let us show you around so you can start discovering sustainable treasures in your community.',
      disableBeacon: true,
    },
    {
      target: '.tour-sell-button',
      title: 'List an Item',
      content: 'Have something to share? Click here to easily list your items for others.',
      placement: 'bottom',
    },
    {
      target: '.tour-help-button',
      title: 'Need Help?',
      content: 'If you ever want to see this tutorial again, just click this question mark!',
      placement: 'bottom',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false); // Stop the tour when finished or skipped
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={runTour}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      steps={steps}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.6)', // Darkens background to make popup pop
          primaryColor: '#1e513b', // Your EcoExchange Dark Green!
          textColor: '#333333',
          width: 400,
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '12px', // Smooth, modern rounded corners
          padding: '10px',
        },
        buttonNext: {
          backgroundColor: '#1e513b',
          borderRadius: '6px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#1e513b',
        }
      }}
    />
  );
};

export default OnboardingTour;