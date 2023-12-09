import React, { useState, useEffect } from "react";
import * as client from "./client";
import { BsFillCheckCircleFill, BsPlusCircleFill } from "react-icons/bs";
import { BsTrash3Fill, BsPencil } from "react-icons/bs";
import { Link } from "react-router-dom";
import "../randomCss/galaxy.scss";
import styles from "./UserTable.module.css";

function UserTable() {
    const [users, setUsers] = useState([]);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [user, setUser] = useState({ username: "", password: "", role: "USER" });
    const createUser = async () => {
        console.log(user);
        if (!user.username || !user.password) {
            setError("Username and Password are required!");
            return;
        }
        try {
            const response = await client.createUser(user);
            if (response && response.message === "User created successfully") {
                setUsers([response.user, ...users]);
                setError("");
                alert("User created successfully");
            } else {
                setError("Unexpected response from server");
            }
        } catch (err) {
            setError(err.response?.data?.message || "User creation failed");
        }
    };
    const deleteUser = async (user) => {
        try {
            await client.deleteUser(user);
            setUsers(users.filter((u) => u._id !== user._id));
        } catch (err) {
            console.log(err);
        }
    };

    const selectUser = async (user) => {
        try {
            const u = await client.findUserById(user._id);
            setUser(u);
        } catch (err) {
            console.log(err);
        }
    };
    const updateUser = async () => {
        try {
            const response = await client.updateUser(user);
            if (response && response.message === "User updated successfully") {
                setUsers(users.map((u) => (u._id === user._id ? user : u)));
                setError("");
                alert("User updated successfully");
            } else {
                setError("Unexpected response from server");
            }
        } catch (err) {
            setError(err.response?.data?.message || "User update failed");
        }
    };


    const fetchUsers = async () => {
        const users = await client.findAllUsers();
        setUsers(users);
    };
    useEffect(() => { fetchUsers(); }, []);
    const fetchProfile = async () => {
        try {
            const profileData = await client.profile();
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchUsers();
    }, []);
    const AdminTable = () => {
        return (
            <div className="table-container">
                {error && <div className="error-message">{error}</div>}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Password</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                        <tr>
                            <td>
                                <input className="table-input form-control" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />

                            </td>
                            <td>
                                <input className="table-input form-control" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} />
                            </td>
                            <td>
                                <input className="table-input form-control" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
                            </td>
                            <td>
                                <input className="table-input form-control" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
                            </td>
                            <td>
                                <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="ARTIST">Artist</option>
                                </select>
                            </td>
                            <td className="text-nowrap">
                                <BsFillCheckCircleFill onClick={updateUser}
                                    className="update-button button-success me-2 text-success fs-1 text" />
                                <BsPlusCircleFill onClick={createUser}
                                    className="update-button button-success text-success fs-1 text" />
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <Link className="table-link" to={`/profile/${user._id}`}>
                                        {user.username}
                                    </Link>
                                </td>
                                <td>{user.password}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.role}</td>
                                <td className="text-nowrap">

                                    <button className="btn btn-warning me-2">
                                        <BsPencil onClick={() => selectUser(user)} />
                                    </button>
                                    <button className="update-button btn btn-danger me-2">
                                        <BsTrash3Fill onClick={() => deleteUser(user)} />
                                    </button>
                                </td>
                            </tr>))}

                    </tbody>
                </table>
            </div>
        );
    }
    const UserTable = () => {
        return (
            <div className="table-container">
                <table className={styles.table}>
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
                                    <Link to={`/profile/${user._id}`} className="table-link">
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
    return (
        <div className="galaxy-background">
            <h1 className={styles.headerTitle}>Users</h1>
            <div className="animation-wrapper">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
            </div>
            <div className={styles.table}>
                {profile && profile.role === "ADMIN" ? <AdminTable /> : <UserTable />}
            </div>
        </div>
    );


}
export default UserTable;