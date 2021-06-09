import React, { useEffect, useContext } from 'react';

import { GlobalState } from '../contexts/Store';

const Dashboard = () => {
    const { auth, getUserData } = useContext(GlobalState);
    const [user, setUser] = auth;

    user.friends = user.friends || [];
    user.concerts = user.concerts || [];

    // console.log(user, 'dashboard')

    // useEffect(() => {
    //     getUserData();
    // }, []);

    return (
        <>
            <p>See {user.id ? user.firstName : 'User'}'s events</p>
            <p>Friends:</p>
            <ul>
                {user.friends.map((friend) =>
                    friend.friendship.status === 'accepted' ? (
                        <li key={friend.id}>{friend.firstName}</li>
                    ) : (
                        <div key={friend.id}></div>
                    )
                )}
            </ul>
            <p>Upcoming Concerts:</p>
            <ul>
                {user.concerts.map((concert) => (
                    <li key={concert.id}>{concert.name}</li>
                ))}
            </ul>
        </>
    );
};

export default Dashboard;
