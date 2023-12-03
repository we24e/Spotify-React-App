import React, { useState, useEffect } from "react";
import * as client from "./client";
import { Link } from "react-router-dom";

function UserTable() {
    const [users, setUsers] = useState([]);
    const fetchUsers = async () => {
        const users = await client.findAllUsers();
        setUsers(users);
    };

    useEffect(() => { fetchUsers(); }, []);
    return (
        <div>
            <h1>User List</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>
                                <Link to={`/profile/${user._id}`} className="no-underline">
                                    {user.username}
                                </Link>
                            </td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                        </tr>))}

                </tbody>
            </table>
        </div>
    );
}
export default UserTable;