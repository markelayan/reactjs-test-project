import React, { Fragment } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  MarkerClusterer,
  InfoWindow,
  OverlayView,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "70vh",
};

let center = {
  lat: -3.745,
  lng: -38.523,
};

const onClick = () => {
  console.info("I have been clicked!");
};

function MyComponent(props) {
  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);
  const position = { lat: 33.772, lng: -117.214 };
  const divStyle = {
    background: `white`,
    border: `1px solid #ccc`,
    padding: 15,
  };

  const getMarkers = () => {
    const locations = props.locations;
    let stores = locations.map((location) => {
      return {
        id: location.id,
        name: location.name,
        fee: location.fee,
        latitude: location.lat,
        longitude: location.long,
      };
    });

    center = {
      lat: stores[0].latitude,
      lng: stores[0].longitude,
    };
    return stores;
  };
  let overlayIndex;

  const displayMarkers = (stores) => {
    return stores.map((place, index) => {
      let position = {
        lat: place.latitude,
        lng: place.longitude,
      };
      let id = place.id;
      return (
        <Fragment key={id}>
          <Marker
            position
            onClick={updateIndex.bind(null, id, position)}
            index={index}
            onLoad={onLoad}
            title={`${place.name} \nFee:${place.fee}`}
            position={{
              lat: place.latitude,
              lng: place.longitude,
            }}
          />
        </Fragment>
      );
    });
  };

  //   const overlayUpdate = (position) => {
  //     return (

  //     );
  //   };

  const updateIndex = (i, position) => {
    console.log(i, position);
    overlayIndex = i;
    console.log(overlayIndex);
    props.clicked(i);

    // overlayUpdate(position);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyCQMnvn-2c-_RjPos3YXb0UXXM3T5e8FU4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {displayMarkers(getMarkers())}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MyComponent);
