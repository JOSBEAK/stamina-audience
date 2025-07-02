import React from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import {
  Controller,
  Control,
  FieldError,
  ControllerRenderProps,
} from 'react-hook-form';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LocationInputProps {
  control: Control<any>;
  error: FieldError | undefined;
}

const libraries: 'places'[] = ['places'];

// Helper component to correctly scope the hooks
const GoogleAutocomplete = ({
  field,
  error,
}: {
  field: ControllerRenderProps<any, 'location'>;
  error?: FieldError;
}) => {
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(
    null
  );

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      field.onChange(place.formatted_address || place.name || '');
    }
  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <Input
        {...field}
        type="text"
        placeholder="Enter a location"
        className={error ? 'border-destructive' : ''}
      />
    </Autocomplete>
  );
};

const LocationInput: React.FC<LocationInputProps> = ({ control, error }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  if (!apiKey) {
    const errorMsg =
              'Google Maps API Key is missing. Please create `apps/audience-management-web/.env` and add `NX_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE`. Then, restart the server.';
    console.error(errorMsg);
    return <p className="text-destructive">{errorMsg}</p>;
  }

  return isLoaded ? (
    <div>
      <Label>Location *</Label>
      <Controller
        name="location"
        control={control}
        rules={{ required: 'This field is required.' }}
        render={({ field }) => (
          <GoogleAutocomplete field={field} error={error} />
        )}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error.message}</p>}
    </div>
  ) : (
    <div>Loading location search...</div>
  );
};

export default LocationInput; 