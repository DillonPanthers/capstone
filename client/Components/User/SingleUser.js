import React, { useContext, useState, useEffect } from 'react';
import { Button, Container, Typography } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

import axios from 'axios';
import { GlobalState } from '../../contexts/Store';

function SingleUser(props) {
    const { auth } = useContext(GlobalState);
    const [currentUser] = auth;
    const [user, setUser] = useState({});
    const [isFriend, setIsFriend] = useState(false);
    const [isProfile, setIsProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { id } = props.match.params;
            const user = await axios.get(`/api/user/${id}`);
            setUser(user.data);
            console.log(user.data);
        };

        getUser();
    }, [props.match.params]);

    const checkIfFriend = async () => {
        //Would this technically just be the current user from the auth?
        const token = window.localStorage.getItem('token');
        const response = await axios.get('/api/auth', {
            headers: {
                authorization: token,
            },
        });
        //this is logged in users data, we are checking to see if the current pages friend id matches out user data id friend array, then we display
        const userData = response.data;

        if (userData.id === user.id) {
            setIsProfile(true);
        }

        userData.friends.forEach((friend) => {
            //we map over the logged in users friends, and see if they have a friend id in their friends array equal to the current user page's id
            if (friend.id === user.id) {
                setIsFriend(true);
            }
        });

        //using this to check to see if a user is logged in or not
        if (token) {
            setIsLoggedIn(true);
        }
    };

    const addFriend = async (friendId, userId) => {
        await axios.post('/api/user/add-friend', {
            friendId,
            userId,
        });
    };

    checkIfFriend();

    console.log('user is here', user);
    //TODO: Update page view for if a user searches themselves up, and are logged in, to redirect them to a dashboard
    //TODO: Logic for if a user is searching someone up without logging
    //TODO: What should show if a user has a friend request from someone pending, should the button view for someone viewing the profile
    //of someone who has added them say something along the lines of "accept friend request" in the case of a pending friend request? Maybe we can get this specific as a bonus
    //if time permits.
    //TODO: Friends View Component for if users are friends already

    //the reason why the else part of the ternary works without checking to see if a user exists is because on initial load, the user is
    //going to be an {} empty object, and then afterwards it gets populated, and technically user.fullName of an empty object would be undefined.
    //If the user is logged in and searches their own profile up, it will redirect them to their own dashboard page

    return (
        <Container>
            {isLoggedIn && Object.keys(user).length > 0 ? (
                <Container>
                    <Typography>{user.fullName}</Typography>
                    {isFriend ? (
                        `${user.fullName} is friends with you!`
                    ) : isProfile ? (
                        <Redirect to="/dashboard" />
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => addFriend(user.id, currentUser.id)}
                        >
                            Add Friend
                        </Button>
                    )}
                </Container>
            ) : (
                <Typography>{user.fullName}</Typography>
            )}
        </Container>
    );
}

export default SingleUser;
