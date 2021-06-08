import React, { useEffect, useContext, useState } from 'react';
import { Typography, Button, Container, makeStyles } from '@material-ui/core';
import axios from 'axios';

import { GlobalState } from '../../contexts/Store';

const useStyles = makeStyles((theme) => ({
    margin: theme.spacing(1),
    button: {
        color: 'white',
        backgroundColor: 'gray',
        maxHeight: '20px',
        marginRight: '5px',
        marginLeft: '5px',
    },
}));

//TODO: Do we really need a block button? Is Add or Remove enough?

function FriendRequests() {
    const { auth, getUserData } = useContext(GlobalState);
    const [user] = auth;
    const [friendRequests, setFriendRequests] = useState([]);

    const classes = useStyles();

    const getFriendRequests = async () => {
        const jwtToken = window.localStorage.getItem('token');
        const requests = await axios.get(`/api/user/friendrequests`, {
            headers: {
                authorization: jwtToken,
                spotify: false,
            },
        });
        setFriendRequests(requests.data);
    };

    useEffect(() => {
        if (user.id) {
            console.log('here');
            getFriendRequests();
        }
    }, [user]);

    //should we change this function name to accept friend?
    const addFriend = async (requesterId, inviteeId) => {
        await axios.post('/api/user/accept-friend', {
            requesterId,
            inviteeId,
        });
        getFriendRequests();
        await getUserData();
    };

    const ignoreFriend = () => {
        console.log('IGNORE ME');
    };
    const blockFriend = () => {
        console.log('BLOCK ME');
    };

    //TODO: Get button css working
    return (
        <Container>
            {friendRequests.map((request) => {
                console.log(request);

                return (
                    <Container key={request.userId}>
                        <Typography>{request.userInfo.fullName}</Typography>
                        <Button
                            className={classes.button}
                            onClick={() => addFriend(request.userId, user.id)}
                        >
                            Add
                        </Button>
                        <Button
                            onClick={() => ignoreFriend()}
                            className={classes.button}
                        >
                            Ignore
                        </Button>
                        <Button
                            onClick={() => blockFriend()}
                            className={classes.button}
                        >
                            Block
                        </Button>
                    </Container>
                );
            })}
        </Container>
    );
}

export default FriendRequests;
