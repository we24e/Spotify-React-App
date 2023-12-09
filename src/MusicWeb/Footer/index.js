import React from 'react';
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { SiBilibili } from 'react-icons/si';
import { RiNeteaseCloudMusicFill } from "react-icons/ri";
import './index.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    Created by Xuyang Wang & Min Sun
                </div>
                <div className="footer-right">
                    <a href="https://github.com/we24e" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                    <a href="https://music.163.com/#/artist?id=28413432" target="_blank" rel="noopener noreferrer"><RiNeteaseCloudMusicFill /></a>
                    <a href="https://www.linkedin.com/in/adam-xuyangwang" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                    <a href="https://www.instagram.com/we24e" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    <a href="https://space.bilibili.com/74964358" target="_blank" rel="noopener noreferrer"><SiBilibili /></a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;