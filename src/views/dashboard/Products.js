import React from "react";
import { CCol, CFormGroup, CLabel, CSelect } from "@coreui/react";

function Products(props) {
  const products = props.products;

  return (
    <CFormGroup row>
      <CCol md="3">
        <CLabel htmlFor="select">Product</CLabel>
      </CCol>
      <CCol xs="12" md="4">
        <CSelect
          custom
          name="select"
          id="select-product"
          onChange={props.click}
        >
          <option value="0">Please Select Product</option>
          {products.map((product, i) => (
            <option key={i} value={product.id}>
              {product.name}
            </option>
          ))}
        </CSelect>
      </CCol>
    </CFormGroup>
  );
}

export default Products;
