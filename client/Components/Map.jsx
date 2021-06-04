import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
} from '@react-google-maps/api';

import { GlobalState } from '../contexts/Store';
import { TICKETMASTERAPIKEY, REACT_APP_GOOGLEAPIKEY } from '../secret';

import Loading from './Loading/Loading'



function Map() {

    const [state, setState] = useState({
        lat: 0,
        lon: 0,
        ticketDataByLocation: [],
        selectedEventLat: 0,
        selectedEventLong: 0,
        selectedEventName: '',
        isOpen: false,
    });

    const [isLoading, setIsLoading] = useState(true); 

    const {currSingleConcert} = useContext(GlobalState); 
    const {concerts, location}= useContext(GlobalState)
    const [concertData, setConcerts]= concerts
    const [locationData, setLocation]= location
    const [singleConcert, setSingleConcert] = currSingleConcert; 

    const onMarkerPopup = function (event) {
        setSingleConcert(event); 

        const selectedEventLat = +event.venueData.location.latitude;
        const selectedEventLong = +event.venueData.location.longitude;
        const selectedEventName = event.venueData.name;
 

        setState({
            ...state,
            selectedEventLat,
            selectedEventLong,
            selectedEventName,
            isOpen: !state.isOpen,
        });
    };

    useEffect(() => {
        const getUserLocation = async () => {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({lat:position.coords.latitude, lon:position.coords.longitude})
                setState({
                    ...state,
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            });
        };

        const getConcertData = async () => {
            const latlong = state.lat + ',' + state.lon;
            const ticketDataByLocation = await axios.get(
                `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&size=200&latlong=${latlong}&apikey=${TICKETMASTERAPIKEY}`
            );
           
       
       /**
        * I am taking the json from the ticketmaster data, manipulating it and setting our global state concerts field, which we should probably rename venues.
        * 
        * In venueObj below, I am taking the data and setting up an object that has just the venues as the keys, and the values of each of the keys, 
        * will also be an object with two keys, one being venueData which would be the data of the current venue, and the second being a venueEvents, which 
        * I am storing in a set because I didn't really want to have that as another object key value pair. 
        */     
      const venueObj = ticketDataByLocation.data._embedded.events.reduce((accum, event)=>{
        const venueName = event._embedded.venues[0].name; 
        if(!accum.hasOwnProperty(venueName)){
    //Here I am grabbing the venue data and setting it as that venues personal data. 
          const venueData = event._embedded.venues[0]; 
          accum[venueName] = {venueData: venueData, venueEvents: new Set() }; 
        }
        return accum; 
      },{})


      /**
       * Now that I have an object that would look something like 
       * {
       *    Barclays Center: { venueData: {data of venue details here}, venueEvents: {will be a set that has the concerts at this venue} }
       * }
       * 
       * Below I am modifying those fields. For each of the events I am populating the concerts part of the venue in the object I already set up above. 
       * 
       */

      ticketDataByLocation.data._embedded.events.forEach(event =>{
        const eventVenue = event._embedded.venues[0].name; 
        venueObj[eventVenue].venueEvents.add(event)
      })

      //concerts, which we should probably change to venues, are now going to be equal to the venueObj that was set up above this. 
            setConcerts(venueObj); 

            setState({
                ...state,
                ticketDataByLocation:
                    ticketDataByLocation.data._embedded.events,
            });
        };

        if (state.lon && state.lat) {
            getConcertData();
            setTimeout(() => {
                setIsLoading(false);
              }, 2000);
        }
        getUserLocation();
    }, [state.lat]);

   

    return (
        //TODO:Filter by genre, and not keyword
        //TODO:Change color of our home marker 
        //TODO:Extra feature -> Dragging the map and update location of where we drag to.
        //TODO: Do we need location data in global state? Double check. 
        //TODO: Cleanup unnecessary code in this component
        //TODO: Update SingleConcert component to singleVenue now that we are populating venues on the map. 
        //TODO: Update SingleConcert hook and store value as well. 
        //NOTE: Are we using ticketDataByLocation in the state here in line 23 at all? If not let's get rid of it. 

        
        isLoading?  <Loading loading={isLoading}/> :

        <LoadScript googleMapsApiKey={REACT_APP_GOOGLEAPIKEY}>
            <GoogleMap
                zoom={10}
                center={{ lat: state.lat, lng: state.lon }}
                mapContainerStyle={{ height: '100vh', width: '100vw' }}
            >
                <Marker
                    position={{
                        lat: +locationData.lat,
                        lng: +locationData.lon,
                    }}
                />

                {concertData ? Object.keys(concertData).map((currEvent) => {
                    if(concertData[currEvent].venueData.location){
                        
                        return (
                            <Marker
                                key={concertData[currEvent].venueData.id}
                                onClick={() => onMarkerPopup(concertData[currEvent])}
                        
                                position={{
                                    lat: +concertData[currEvent].venueData.location
                                        .latitude,
                                    lng: +concertData[currEvent].venueData.location
                                        .longitude,
                                }}
    
                        
                            />
                        );
                    }
                }): null}

                {state.isOpen && (
                    <InfoWindow
                        position={{
                            lat: state.selectedEventLat,
                            lng: state.selectedEventLong,
                        }}
                    >
                        <div>
                            <Link to={`/concert/${singleConcert.id}`}>
                                {state.selectedEventName}
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
    
}

export default Map;