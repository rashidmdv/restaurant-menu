'use client';

import { useState, useEffect } from 'react';
import { contentService, restaurantService, menuService } from '../services/api';

export function useHomeData() {
  const [data, setData] = useState({
    hero: null,
    story: null,
    people: null,
    restaurant: null,
    hours: null,
    featuredItems: null
  });
  
  const [loading, setLoading] = useState({
    hero: true,
    story: true,
    people: true,
    restaurant: true,
    hours: true,
    featuredItems: true
  });
  
  const [errors, setErrors] = useState({
    hero: null,
    story: null,
    people: null,
    restaurant: null,
    hours: null,
    featuredItems: null
  });

  const setDataAndLoading = (key, data, error = null) => {
    setData(prev => ({ ...prev, [key]: data }));
    setLoading(prev => ({ ...prev, [key]: false }));
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, storyRes, peopleRes, restaurantRes, hoursRes, featuredRes] = await Promise.allSettled([
          contentService.getHeroContent(),
          contentService.getStoryContent(),
          contentService.getPeopleContent(),
          restaurantService.getRestaurantInfo(),
          restaurantService.getOperatingHours(),
          menuService.getFeaturedItems({ limit: 4 })
        ]);

        if (heroRes.status === 'fulfilled') {
          setDataAndLoading('hero', heroRes.value?.data);
        } else {
          console.error('Hero API Error:', heroRes.reason);
          setDataAndLoading('hero', null, heroRes.reason);
        }

        if (storyRes.status === 'fulfilled') {
          setDataAndLoading('story', storyRes.value?.data);
        } else {
          console.error('Story API Error:', storyRes.reason);
          setDataAndLoading('story', null, storyRes.reason);
        }

        if (peopleRes.status === 'fulfilled') {
          setDataAndLoading('people', peopleRes.value?.data);
        } else {
          console.error('People API Error:', peopleRes.reason);
          setDataAndLoading('people', null, peopleRes.reason);
        }

        if (restaurantRes.status === 'fulfilled') {
          const restaurantData = restaurantRes.value?.data;
          setDataAndLoading('restaurant', restaurantData);
          // Extract hours from restaurant response since they come together
          setDataAndLoading('hours', restaurantData?.operating_hours);
        } else {
          console.error('Restaurant API Error:', restaurantRes.reason);
          setDataAndLoading('restaurant', null, restaurantRes.reason);
          setDataAndLoading('hours', null, restaurantRes.reason);
        }

        // Skip separate hours call since they come with restaurant info
        if (hoursRes.status === 'fulfilled') {
          // Only use separate hours if restaurant request failed
          if (restaurantRes.status !== 'fulfilled') {
            setDataAndLoading('hours', hoursRes.value?.data);
          }
        } else if (restaurantRes.status !== 'fulfilled') {
          console.error('Hours API Error:', hoursRes.reason);
          setDataAndLoading('hours', null, hoursRes.reason);
        }

        if (featuredRes.status === 'fulfilled') {
          setDataAndLoading('featuredItems', featuredRes.value?.data);
        } else {
          console.error('Featured Items API Error:', featuredRes.reason);
          setDataAndLoading('featuredItems', null, featuredRes.reason);
        }

      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };

    fetchData();
  }, []);

  const isAnyLoading = Object.values(loading).some(Boolean);
  const hasAnyError = Object.values(errors).some(Boolean);

  return {
    data,
    loading,
    errors,
    isAnyLoading,
    hasAnyError
  };
}