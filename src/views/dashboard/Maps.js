import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

// We will use these things from the lib
// https://react-google-maps-api-docs.netlify.com/
import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

function Map(props) {
  // The things we need to track in state
  const [mapRef, setMapRef] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerMap, setMarkerMap] = useState({});
  const [center, setCenter] = useState({ lat: 44.076613, lng: -98.362239833 });
  const [zoom, setZoom] = useState(5);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Load the Google maps scripts
  const { isLoaded } = useLoadScript({
    // Enter your own Google Maps API key
    googleMapsApiKey: "AIzaSyCQMnvn-2c-_RjPos3YXb0UXXM3T5e8FU4",
  });

  // The places I want to create markers for.
  // This could be a data-driven prop.
  const locations = props.locations;
  console.log(locations);
  let myPlaces = locations.map((location) => {
    return {
      id: location.id,
      pos: { lat: location.lat, lng: location.long },
      name: location.name,
      fee: location.fee,
      max_dist: location.max_dist,
    };
  });

  // Iterate myPlaces to size, center, and zoom map to contain all markers
  const fitBounds = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    myPlaces.map((place) => {
      bounds.extend(place.pos);
      return place.id;
    });
    map.fitBounds(bounds);
  };

  const loadHandler = (map) => {
    // Store a reference to the google map instance in state
    setMapRef(map);
    // Fit map bounds to contain all markers
    fitBounds(map);
  };

  // We have to create a mapping of our places to actual Marker objects
  const markerLoadHandler = (marker, place) => {
    return setMarkerMap((prevState) => {
      return { ...prevState, [place.id]: marker };
    });
  };

  const markerClickHandler = (event, place) => {
    // Remember which place was clicked
    setSelectedPlace(place);

    // Required so clicking a 2nd marker works as expected
    if (infoOpen) {
      setInfoOpen(false);
    }

    setInfoOpen(true);

    // If you want to zoom in a little on marker click
    if (zoom < 13) {
      setZoom(13);
    }

    // if you want to center the selected Marker
    //setCenter(place.pos)
  };

  const updateIndex = (id) => {
    console.log(props);
    props.clicked(id);

    // overlayUpdate(position);
  };

  const renderMap = () => {
    return (
      <Fragment>
        <GoogleMap
          // Do stuff on map initial laod
          onLoad={loadHandler}
          // Save the current center position in state
          // Save the user's map click position
          onClick={(e) => setClickedLatLng(e.latLng.toJSON())}
          center={center}
          zoom={zoom}
          mapContainerStyle={{
            height: "70vh",
            width: "100%",
          }}
        >
          {myPlaces.map((place) => (
            <Marker
              key={place.id}
              position={place.pos}
              onLoad={(marker) => markerLoadHandler(marker, place)}
              onClick={(event) => markerClickHandler(event, place)}
            />
          ))}

          {infoOpen && selectedPlace && (
            <InfoWindow
              anchor={markerMap[selectedPlace.id]}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="infoWindow-info">
                <h5>{selectedPlace.name}</h5>
                <p>Max Units: {selectedPlace.max_dist}</p>
                <p>fee: {selectedPlace.fee}</p>
                <button onClick={updateIndex.bind(this, selectedPlace.id)}>
                  {" "}
                  Add
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </Fragment>
    );
  };

  return isLoaded ? renderMap() : null;
}
export default React.memo(Map);
