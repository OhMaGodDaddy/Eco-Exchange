import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

function OnboardingTour({ runTour, setRunTour }) {
  // 1. Define the steps of the tour
  // The 'target' must match a CSS class or ID on your actual elements!
  const steps = [
    {
      target: 'body', // Starts in the middle of the screen
      content: 'Welcome to EcoExchange! Let’s take a quick tour to show you around.',
      placement: 'center',
    },
    {
      target: '.tour-post-item', // We will add this class to your Post Item button
      content: 'Click here to give an item away. You can easily upload photos and add your location!',
    },
    {
      target: '.tour-search-bar', // Add this to your search bar
      content: 'Looking for something specific? Search for items near your hub here.',
    },
    {
      target: '.tour-profile', // Add this to your profile link
      content: 'Check your profile to see the items you are giving away or claimed.',
    }
  ];

  // 2. Check if it's their first time when the app loads
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, [setRunTour]);

  // 3. Handle when the user skips or finishes the tour
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenTour', 'true'); // Never show automatically again
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}      // Shows 'Next' button
      showSkipButton={true}  // Shows 'Skip' button
      showProgress={true}    // Shows "1 of 4"
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#1B4332', // Matches your app's green theme
          zIndex: 10000,
        },
      }}
    />
  );
}

export default OnboardingTour;