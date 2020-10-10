import React from "react";
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
} from "@coreui/react";


const ThankYou = () => {
    
    document.getElementById("loadSpinner").classList = ''
  return (
    <>
      <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardBody>
            <h1 className="text-center">Thank you</h1>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default ThankYou;
