import React, { useContext, useState, useEffect } from 'react';
import { Button, Container, Typography } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import { GlobalState } from '../../contexts/Store';
import UserInfo from './UserInfo';

function SingleUser(props) {
    const { auth, getUserData } = useContext(GlobalState);
    // console.log(useContext(GlobalState), 'use context here');
    const [currentUser] = auth;
    // console.log(currentUser, 'here is auth first time sfljasdfljasf');
    const [user, setUser] = useState({});
    const [friendship, setFriendship] = useState(false);
    const [isProfile, setIsProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        console.log('auth here useeffect', currentUser);
        const { id } = props.match.params;
        if (id === currentUser.id) {
            setIsProfile(true);
        }

        const getUser = async () => {
            const { id } = props.match.params;
            const user = await axios.get(`/api/user/${id}`);
            setUser(user.data);
            setFriends(user.data.friends);
            if (currentUser.id) {
                setFriendship(checkStatus());
            }
        };

        const checkStatus = () => {
            const areFriends = currentUser.friends.some(
                (friend) =>
                    friend.id === props.match.params.id &&
                    friend.friendship.status === 'accepted'
            );

            if (areFriends) {
                return 'friends';
            } else {
                const sentRequest = currentUser.friends.some(
                    (friend) =>
                        friend.id === props.match.params.id &&
                        friend.friendship.status === 'pending'
                );
                if (sentRequest) {
                    return 'sentRequest';
                } else {
                    const recievedRequest = user.friends.some(
                        (friend) =>
                            friend.id === currentUser.id &&
                            friend.friendship.status === 'pending'
                    );
                    return recievedRequest ? 'recievedRequest' : 'notFriends';
                }
            }
        };
        getUser();
    }, [props.match.params.id, currentUser, user.id, friends.length]);

    const onButtonClick = async (event) => {
        const action = event.target.innerHTML;
        const friendId = user.id;
        const userId = currentUser.id;
        if (action === 'add friend') {
            await axios.post('/api/user/add-friend', {
                friendId,
                userId,
            });
            getUserData();
            //TODO: make sure that the post
        } else if (action === 'accept friend') {
            await axios.post('/api/user/accept-friend', {
                requesterId: friendId,
                inviteeId: userId,
            });
            await getUserData();
        }
    };

    const rejectFriend = async (onPageUser) => {
        const requesterId = onPageUser.id;
        const inviteeId = currentUser.id;
        await axios.delete('/api/user/reject-friend', {
            data: { requesterId, inviteeId },
        });
        const user = await axios.get(`/api/user/${requesterId}`);
        setUser(user.data);
        console.log(user.data.friends, 'user data friends');
        setFriends(user.data.friends);
    };

    //1) logged in user and own profile - redirect to dashboard - done
    //2) logged in user and other user - if both are friends, then show other users profile
    //3) logged in user and other user are not friends and no friend requests - show button to add friend, if public then show profile, if private than show just name
    //4) logged in user sent a friend request - show requested instead of add friend on button
    //5) other user sent logged in user a friend request - show accept/reject

    return (
        <div>
            <div>{user.fullName ? user.fullName : null}</div>
            {friendship === 'friends' ? (
                <div>you are friends!</div>
            ) : (
                <div>
                    <Button onClick={onButtonClick} variant="contained">
                        {friendship === 'notFriends'
                            ? 'add friend'
                            : friendship === 'sentRequest'
                            ? 'requested'
                            : 'accept friend'}
                    </Button>{' '}
                    {friendship === 'recievedRequest' ? (
                        <Button
                            onClick={() => rejectFriend(user)}
                            variant="contained"
                        >
                            Reject
                        </Button>
                    ) : null}
                </div>
            )}
            {isProfile ? (
                <Redirect to="/dashboard" />
            ) : friendship === 'friends' ? (
                <UserInfo />
            ) : (
                'Not Friends'
            )}
        </div>
    );
}

export default SingleUser;
