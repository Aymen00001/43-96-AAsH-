// Form.js
import React, { useState } from "react";
import { FaChartPie, FaCcVisa, FaTicketAlt, FaChartBar, FaChartLine, FaChartArea, FaDrumstickBite, FaStickerMule, FaRegStickyNote } from "react-icons/fa";
import { Row, Col, Card, CardBody, CardFooter, CardTitle } from "reactstrap";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MoneyIcon from '@mui/icons-material/Money';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import myImage from "./ticket.png";

import "./dt.css";





function Form({ key1, devise, value, StartDate, EndDate }) {

  const [val, setval] = useState(value);
  const formatValue = (value, devise) => {
    if (devise === "DT") {
      return parseFloat(value).toFixed(3); // Formats to three decimal places
    } else if (devise === "chiffre") {
      return value
    }else {
      return parseFloat(value).toFixed(2);
    }
  };
  const formatDate = (date) => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const color = (key1) => {
    //MODE PAIEMENT
    // if (key1 === "TICKET_RESTO") {
    //   return "74CED6"; 
    // } 
    // else if (key1 === "ESPECES"){
    //   return "5990A8"; 
    // }else if (key1 === "CARTE_BANCAIRE"){
    //   return "B08EA2"; 
    // }

    // else if (key1 === "SODEXO"){
    //   return "657391"; 
    // }
    //   //MODE CONSOMATIONS
    // else if (key1 === "A_Emporter"){
    //   return "6E7290";
    // } else if (key1 === "SurPlace"){
    //   return "537594";
    // }
    // else if (key1 === "Livraison"){
    //   return "867893";
    // }
    //   // C.A
    //  if (key1 === "Total_HT"){
    //   return "FF9A00";
    // }
    // else if (key1 === "TVA"){
    //   return "FF0325"; 
    // }
    // else if (key1 === "Total_TTC"){
    //   return "68DE00"; // Return as it is
    // }

    // else {
    // const randomColor = getRandomColor();
    return "FFFFFF"
  }
  // };

  const replaceUnderscores = (str) => {
  if (str ==="Encaiser"){str="Encaissés"}
  if (str ==="Rembourser"){str="Remboursés"}
  if (str ==="Annuler"){str="Annulés"}
  if (str ==="SurPlace"){str="Sur Place"}
    return str.replace(/_/g, " ");
  };


  function getRandomColor() {
    const randomValue = Math.random();
    return randomValue < 0.5 ? "B7BECD" : "CED4DE";
  }


  const replaceicon = (key1) => {
    //MODE PAIEMENT
    if (key1 === "TICKET_RESTO") {
      return <FaTicketAlt style={{ width: "55px", height: "55px", color: "537594" }} />;
    }
    else if (key1 === "ESPECES") {
      return <AttachMoneyIcon style={{ width: "55px", height: "55px", color: "6E7290" }} />;
    } else if (key1 === "CARTE_BANCAIRE") {
      return <FaCcVisa style={{ width: "55px", height: "55px", color: "657391" }} />;
    }
    else if (key1 === "SODEXO") {
      return <FaRegStickyNote style={{ width: "55px", height: "55px", color: "B08EA2" }} />;
    }


    //MODE CONSOMATIONS
    else if (key1 === "SurPlace") {
      return <RestaurantMenuIcon style={{ width: "55px", height: "55px", color: "74CED6" }} />;
    }
    else if (key1 === "A_Emporter") {
      return <DeliveryDiningIcon style={{ width: "55px", height: "55px", color: "5990A8" }} />;
    } else if (key1 === "Livraison") {
      return <DeliveryDiningIcon style={{ width: "55px", height: "55px", color: "6E7290" }} />;
    }
    // C.A
    //FaChartBar,FaChartLine,FaChartArea
    else if (key1 === "Total_HT") {
      return <FaChartBar style={{ width: "55px", height: "55px", color: "#FF9A00" }} />;
    }
    else if (key1 === "TVA") {
      return <FaChartLine style={{ width: "55px", height: "55px", color: "#FF0325" }} />;
    }
    else if (key1 === "Total_TTC") {
      return <FaChartArea style={{ width: "55px", height: "55px", color: "#68DE00" }} />;
    }
    else if (devise === "chiffre") {
      return <div style={{ backgroundImage: `url(${myImage})`, width: "55px", height: "55px", backgroundSize: "cover" }} />;
    }
    else {
      return <CreditCardIcon style={{ width: "55px", height: "55px", color: "657391" }} />
    }
  };

  const formattedValue = formatValue(val, devise);
  const colorChoisi = color(key1);
  const chineChoisi = replaceUnderscores(key1);
  const icon = replaceicon(key1);



  return (
    <Row>
      <Col>
        <Card className="card-stats neumorphism-shadow" style={{ backgroundColor: `#${colorChoisi}` }}>
          <CardBody>
            <Row>
              <Col md="4" xs="5" >
                <div className="icon-big text-center icon-warning" style={{ marginLeft: "-5px" }}>
                  {icon}
                </div>
              </Col>
              <Col md="8" xs="7">
                <div className="numbers">
                  <p className="card-category" style={{ color: 'BLACK', fontSize: "1.3rem" }}><strong>{chineChoisi} </strong></p>
                  <CardTitle tag="p" style={{ color: 'Black', fontSize: "1.8rem" }}><strong>{formattedValue} {devise != "chiffre" && devise}{devise === "chiffre" && " Ticket"}</strong></CardTitle>
                  <p />
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <div className="stats">
              <i className="fas fa-sync-alt" style={{ color: 'BLACK' }} /><strong style={{ color: 'BLACK' }}>{formatDate(StartDate)}-{formatDate(EndDate)}</strong>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </Row>

  );
}

export default Form;
