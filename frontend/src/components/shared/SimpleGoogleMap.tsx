'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Address {
  lat: number;
  lng: number;
  address: string;
  detail?: string;
}

interface SimpleGoogleMapProps {
  pickupAddress?: Address;
  deliveryAddress?: Address;
  onDistanceChange?: (distance: number, duration: number) => void;
  apiKey?: string;
  height?: string;
}

export default function SimpleGoogleMap({
  pickupAddress,
  deliveryAddress,
  onDistanceChange,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  height = '400px',
}: SimpleGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [pickupMarker, setPickupMarker] = useState<google.maps.Marker | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<google.maps.Marker | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const googleMap = new google.maps.Map(mapRef.current, {
            center: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkez
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });

          setMap(googleMap);

          // Directions renderer
          const renderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false, // Marker'ları göster
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 4,
            },
          });
          renderer.setMap(googleMap);
          setDirectionsRenderer(renderer);
        }
      })
      .catch((error) => {
        console.error('Google Maps yüklenemedi:', error);
      });
  }, [apiKey]);

  // Adresler değiştiğinde haritayı güncelle
  useEffect(() => {
    if (!map || !directionsRenderer) return;

    // Önceki marker'ları temizle
    if (pickupMarker) pickupMarker.setMap(null);
    if (deliveryMarker) deliveryMarker.setMap(null);

    if (pickupAddress && deliveryAddress) {
      // Rota hesapla
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: new google.maps.LatLng(pickupAddress.lat, pickupAddress.lng),
          destination: new google.maps.LatLng(deliveryAddress.lat, deliveryAddress.lng),
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            
            // Mesafe ve süre bilgilerini al
            const route = result.routes[0];
            if (route && route.legs[0]) {
              const distanceInKm = route.legs[0].distance ? route.legs[0].distance.value / 1000 : 0;
              const durationInMinutes = route.legs[0].duration ? Math.ceil(route.legs[0].duration.value / 60) : 0;
              
              if (onDistanceChange) {
                onDistanceChange(distanceInKm, durationInMinutes);
              }
            }

            // Haritayı rotaya göre ayarla
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(pickupAddress.lat, pickupAddress.lng));
            bounds.extend(new google.maps.LatLng(deliveryAddress.lat, deliveryAddress.lng));
            map.fitBounds(bounds);
            
            // Biraz zoom out yap
            const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
              const currentZoom = map.getZoom();
              if (currentZoom && currentZoom > 16) {
                map.setZoom(16);
              }
            });
          }
        }
      );
    } else if (pickupAddress) {
      // Sadece alım noktası
      const marker = new google.maps.Marker({
        position: { lat: pickupAddress.lat, lng: pickupAddress.lng },
        map,
        title: 'Alım Noktası',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
      });
      setPickupMarker(marker);
      map.setCenter({ lat: pickupAddress.lat, lng: pickupAddress.lng });
      map.setZoom(15);
    } else if (deliveryAddress) {
      // Sadece teslimat noktası
      const marker = new google.maps.Marker({
        position: { lat: deliveryAddress.lat, lng: deliveryAddress.lng },
        map,
        title: 'Teslimat Noktası',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
      setDeliveryMarker(marker);
      map.setCenter({ lat: deliveryAddress.lat, lng: deliveryAddress.lng });
      map.setZoom(15);
    }
  }, [map, pickupAddress, deliveryAddress, directionsRenderer, onDistanceChange]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
}