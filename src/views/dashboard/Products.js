import React, { Component } from "react";
import {
  CCol,
  CFormGroup,
  CLabel,
  CSelect,
} from "@coreui/react";

const PRODUCT_API = "https://5efabb3a80d8170016f758ee.mockapi.io/products";

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  componentDidMount() {
    fetch(PRODUCT_API )
      .then((res) => res.json())
      .then(
        (products) => {
          this.setState({
            isLoaded: true,
            products: products,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
   

  }

  render (){

    return(

        <CFormGroup row>
                <CCol md="3">
                  <CLabel htmlFor="select">Product</CLabel>
                </CCol>
                <CCol xs="12" md="4">
                  <CSelect
                    custom
                    name="select"
                    id="select-product"
                    items={productNames}
                    onChange={selectedProductHandler}
                  >
                    {productNames.map((product, i) => (
                      <option key={i} value={product}>
                        {product}
                      </option>
                    ))}
                  </CSelect>
                </CCol>
              </CFormGroup>
    )

  }
}

export default Products;