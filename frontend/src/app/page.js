
'use client';

import OurStorySection from "./components/OurStorySection";
import OurPeopleSection from "./components/OurPeopleSection";
import OurLocationSection from "./components/OurLocationSection";
import HeroSection from "./components/HeroSection";
import LoadingScreen from "./components/LoadingScreen";
import { useHomeData } from "./hooks/useHomeData";

export default function Home() {
  const { data, loading, errors, isAnyLoading } = useHomeData();

  if (isAnyLoading && !data.hero && !data.story && !data.people && !data.restaurant) {
    return <LoadingScreen />;
  }

  return (
    <main>
      <HeroSection 
        heroData={data.hero} 
        loading={loading.hero} 
        error={errors.hero} 
      />

      <OurStorySection 
        storyData={data.story} 
        loading={loading.story} 
        error={errors.story} 
      />

      <OurPeopleSection 
        peopleData={data.people} 
        loading={loading.people} 
        error={errors.people} 
      />

      <OurLocationSection 
        restaurantData={data.restaurant} 
        hoursData={data.hours} 
        loading={{ restaurant: loading.restaurant, hours: loading.hours }} 
        error={{ restaurant: errors.restaurant, hours: errors.hours }} 
      />
    </main>
  );
}
