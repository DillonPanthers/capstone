import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Typography, makeStyles } from '@material-ui/core';

import ContainedButton from '../StyledComponents/ContainedButton';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    text: {
        padding: '.5rem',
    },
    link: {
        textDecoration: 'none',
        color: 'white',
        '&:hover': {
            color: '#1DE9B6',
        },
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& *': {
            margin: '.5rem',
        },
    },

    individual: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexBasis: '30%',
        margin: '.6rem',
    },

    avatar: {
        width: '75px',
        height: '75px',
    },
}));

const FriendsList = ({ friends, numOfFriends, text }) => {
    const classes = useStyles();
    const filteredFriends = friends.filter(friend => friend.friendship.status === "accepted");
    const friendsNum = numOfFriends ? numOfFriends : friends.length;
    return friends.length ? (
        <>
            <Typography
                gutterBottom
                variant="h6"
                component="h2"
                className={classes.text}
            >
                {text} {`(${filteredFriends.length})`}
            </Typography>
            <div className={classes.root}>
                {filteredFriends.map((friend) => {
                    return (
                        <div key={friend.id} className={classes.individual}>
                            <Link
                                to={`/user/${friend.id}`}
                                className={classes.link}
                            >
                                <Avatar
                                    className={classes.avatar}
                                    src={friend.imageUrl}
                                >{`${friend.firstName[0]}${friend.lastName[0]}`}</Avatar>
                                {`${friend.firstName} ${friend.lastName}`}
                            </Link>
                        </div>)
                })}
            </div>{' '}
        </>
    ) : (
        <div>
            <Typography
                gutterBottom
                variant="h6"
                component="h2"
                className={classes.text}
            >
                {'No Mutual Friends :('}
            </Typography>
        </div>
    );
};

export default FriendsList;
