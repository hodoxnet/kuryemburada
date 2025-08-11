'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, Navigation } from 'lucide-react';

interface Address {
  lat: number;
  lng: number;
  address: string;
  detail?: string;
}

interface GoogleMapProps {
  onPickupSelect: (address: Address) => void;
  onDeliverySelect: (address: Address) => void;
  pickupAddress?: Address;
  deliveryAddress?: Address;
  apiKey?: string;
}

export default function GoogleMap({
  onPickupSelect,
  onDeliverySelect,
  pickupAddress,
  deliveryAddress,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [pickupMarker, setPickupMarker] = useState<google.maps.Marker | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<google.maps.Marker | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [addressMode, setAddressMode] = useState<'pickup' | 'delivery'>('pickup');
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
            fullscreenControl: false,
          });

          setMap(googleMap);

          // Directions renderer
          const renderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 4,
            },
          });
          renderer.setMap(googleMap);
          setDirectionsRenderer(renderer);

          // Autocomplete başlat
          if (searchInputRef.current) {
            const autocompleteInstance = new google.maps.places.Autocomplete(
              searchInputRef.current,
              {
                componentRestrictions: { country: 'tr' }, // Türkiye ile sınırla
                fields: ['formatted_address', 'geometry', 'name'],
              }
            );

            // Autocomplete seçim eventi
            autocompleteInstance.addListener('place_changed', () => {
              const place = autocompleteInstance.getPlace();
              if (place.geometry && place.geometry.location) {
                const address: Address = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  address: place.formatted_address || place.name || '',
                };

                if (addressMode === 'pickup') {
                  onPickupSelect(address);
                } else {
                  onDeliverySelect(address);
                }

                googleMap.setCenter(place.geometry.location);
                googleMap.setZoom(15);
                setSearchInput('');
              }
            });

            setAutocomplete(autocompleteInstance);
          }

          // Haritaya tıklama eventi
          googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              
              // Geocoding ile adres bilgisi al
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  const address: Address = {
                    lat,
                    lng,
                    address: results[0].formatted_address,
                  };

                  if (addressMode === 'pickup') {
                    onPickupSelect(address);
                  } else {
                    onDeliverySelect(address);
                  }
                }
              });
            }
          });
        }
      })
      .catch((error) => {
        console.error('Google Maps yüklenemedi:', error);
      });
  }, [apiKey]);

  // Autocomplete'i addressMode değiştiğinde güncelle
  useEffect(() => {
    if (autocomplete) {
      // Mevcut listener'ları temizle ve yeni ekle
      google.maps.event.clearInstanceListeners(autocomplete);
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const address: Address = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || '',
          };

          if (addressMode === 'pickup') {
            onPickupSelect(address);
          } else {
            onDeliverySelect(address);
          }

          if (map) {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
          setSearchInput('');
        }
      });
    }
  }, [addressMode, autocomplete, map, onPickupSelect, onDeliverySelect]);

  // Pickup marker güncelle
  useEffect(() => {
    if (map && pickupAddress) {
      if (pickupMarker) {
        pickupMarker.setMap(null);
      }

      const marker = new google.maps.Marker({
        position: { lat: pickupAddress.lat, lng: pickupAddress.lng },
        map,
        title: 'Alım Noktası',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#10B981">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      setPickupMarker(marker);
      updateRoute();
    }
  }, [map, pickupAddress]);

  // Delivery marker güncelle
  useEffect(() => {
    if (map && deliveryAddress) {
      if (deliveryMarker) {
        deliveryMarker.setMap(null);
      }

      const marker = new google.maps.Marker({
        position: { lat: deliveryAddress.lat, lng: deliveryAddress.lng },
        map,
        title: 'Teslimat Noktası',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#EF4444">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      setDeliveryMarker(marker);
      updateRoute();
    }
  }, [map, deliveryAddress]);

  // Rota çiz
  const updateRoute = () => {
    if (map && directionsRenderer && pickupAddress && deliveryAddress) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: { lat: pickupAddress.lat, lng: pickupAddress.lng },
          destination: { lat: deliveryAddress.lat, lng: deliveryAddress.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            
            // Mesafe ve süre bilgisi
            const route = result.routes[0];
            if (route && route.legs[0]) {
              const leg = route.legs[0];
              if (leg.distance) {
                setDistance(leg.distance.value / 1000); // km cinsinden
              }
              if (leg.duration) {
                setDuration(Math.ceil(leg.duration.value / 60)); // dakika cinsinden
              }
            }

            // Haritayı rota sınırlarına göre ayarla
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: pickupAddress.lat, lng: pickupAddress.lng });
            bounds.extend({ lat: deliveryAddress.lat, lng: deliveryAddress.lng });
            map.fitBounds(bounds, { padding: 100 });
          }
        }
      );
    }
  };

  // Adres ara
  const searchAddress = () => {
    if (map && searchInput) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchInput }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const address: Address = {
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address,
          };

          if (addressMode === 'pickup') {
            onPickupSelect(address);
          } else {
            onDeliverySelect(address);
          }

          map.setCenter(location);
          map.setZoom(15);
          setSearchInput('');
        }
      });
    }
  };

  // Mevcut konumu al
  const getCurrentLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address: Address = {
                lat,
                lng,
                address: results[0].formatted_address,
              };

              if (addressMode === 'pickup') {
                onPickupSelect(address);
              } else {
                onDeliverySelect(address);
              }

              map.setCenter({ lat, lng });
              map.setZoom(15);
            }
          });
        },
        (error) => {
          console.error('Konum alınamadı:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Adres Seçim Kontrolü */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Mod Seçimi */}
          <div className="flex gap-2">
            <Button
              variant={addressMode === 'pickup' ? 'default' : 'outline'}
              onClick={() => setAddressMode('pickup')}
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Alım Noktası
            </Button>
            <Button
              variant={addressMode === 'delivery' ? 'default' : 'outline'}
              onClick={() => setAddressMode('delivery')}
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Teslimat Noktası
            </Button>
          </div>

          {/* Adres Arama */}
          <div className="flex gap-2">
            <Input
              ref={searchInputRef}
              placeholder={`${addressMode === 'pickup' ? 'Alım' : 'Teslimat'} adresi ara...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Autocomplete seçimi için Enter'ı engelle
                }
              }}
            />
            <Button onClick={searchAddress} size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button onClick={getCurrentLocation} size="icon" variant="outline">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Seçili Adresler */}
          {pickupAddress && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Alım Noktası:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{pickupAddress.address}</p>
            </div>
          )}

          {deliveryAddress && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Teslimat Noktası:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{deliveryAddress.address}</p>
            </div>
          )}

          {/* Mesafe ve Süre */}
          {distance && duration && (
            <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                Mesafe: {distance.toFixed(1)} km
              </span>
              <span className="text-sm font-medium">
                Tahmini Süre: {duration} dakika
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Harita */}
      <Card className="overflow-hidden">
        <div ref={mapRef} className="w-full h-[500px]" />
      </Card>
    </div>
  );
}