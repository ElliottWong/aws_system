import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import logoWhite from '../assets/images/eISO-admin-logo-white.png';

const Footer = () => {
    return (
        <Container className="l-Footer">
        <footer className="c-Footer">
                {/* Main Content */}
                <Row className="c-Footer__top">
                    <Col md = {12} xl = {4} className="c-Footer__img">
                        <img src={logoWhite} alt="eISO Logo" />
                    </Col>
                    <Col md = {12} xl = {4} className="c-Footer__company">
                        <h1>Company</h1>
                        <p>78B Telok Blangah Street 32,<br/> #03-06, Singapore 102078</p>
                        <a href="#">Contact Us</a>
                    </Col>
                    <Col md = {12} xl = {4} className="c-Footer__legal">
                        <h1>Legal</h1>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms Of Service</a>
                    </Col>
                </Row>

                {/* Horizontal Line */}
                <hr className="c-Footer__hr" />

                {/* Caption */}
                <Row className="c-Footer__caption">
                    <p>Copyright &copy; 2021 Associates Consulting Pte Ltd. All rights reserved.</p>
                </Row>
        </footer>
        </Container>
    )
}

export default Footer;
