import React, { Component, useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CCollapse,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFade,
  CForm,
  CFormGroup,
  CFormText,
  CValidFeedback,
  CInvalidFeedback,
  CTextarea,
  CInput,
  CInputFile,
  CInputCheckbox,
  CInputRadio,
  CInputGroup,
  CInputGroupAppend,
  CInputGroupPrepend,
  CDropdown,
  CInputGroupText,
  CLabel,
  CSelect,
  CRow,
  CBadge,
  CDataTable,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import usersData from "../users/UsersData";
import { render } from "enzyme";
import Map from "./Maps";
import { element } from "prop-types";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      products: [],
      locations: [],
      datePickerClass: "",
      modalOpen: false,
      modalHeader: "",
      todayDate: "",
      tomorrowDate: "",
      next7Days: "",
      currentAddedLocation: "",
      currentAddedProduct: [],
      currentAddedDate: "",
      daysDifference: "",
      maxProduction: "",
      currentMaxDist: "",
      currentLineCost: "",
      cartProducts: [],
    };
  }

  componentDidMount() {
    fetch("https://5efabb3a80d8170016f758ee.mockapi.io/products")
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

    fetch("https://5efabb3a80d8170016f758ee.mockapi.io/locations")
      .then((loc) => loc.json())
      .then(
        (locations) => {
          this.setState({
            isLoaded: true,
            locations: locations,
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
        },
        document.getElementById("loadSpinner").classList.remove("visible")
      );

    const fullDate = new Date();
    const todayDate = fullDate.toISOString().slice(0, 10);
    const tomorrow = new Date(fullDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const limit1Day = tomorrow.toISOString().slice(0, 10);

    const next7Days = new Date(fullDate);
    next7Days.setDate(next7Days.getDate() + 7);
    const limit7Days = next7Days.toISOString().slice(0, 10);

    this.setState({
      todayDate: todayDate,
      tomorrowDate: limit1Day,
      next7Days: limit7Days,
    });
  }

  render() {
    const fields = ["Product", "Place", "units", "cost "];

    let products = this.state.products;
    let productNames = products.map((product) => product.name);
    productNames.unshift("Please select");
    let locations = this.state.locations;
    let datePicker = document.getElementById("date-input");

    const setSelectedDate = () => {
      let tomorrowDate = this.state.tomorrowDate;
      let selectedDate = datePicker.value;
      let lastAvailablDate = this.state.next7Days;
      if (selectedDate < tomorrowDate || selectedDate > lastAvailablDate) {
        datePicker.value = tomorrowDate;
        alert(
          `you can select dates between ${tomorrowDate} and ${lastAvailablDate} only`
        );
      }
      this.setState(
        {
          currentAddedDate: selectedDate,
        },
        calculateDates
      );
    };
    const calculateDates = () => {
      let today = new Date(this.state.todayDate);
      let selected = new Date(this.state.currentAddedDate);

      let difference = selected - today;
      const diffDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
      this.setState(
        {
          daysDifference: diffDays,
        },
        calculateMaxOrder
      );
    };
    const calculateMaxOrder = () => {
      const locationEnabled = document.getElementById("location-name");
      locationEnabled.onclick = openProductModal;
      locationEnabled.firstChild.classList.add("not-selected");
      let difDays = this.state.daysDifference;
      let maxProductionArray = this.state.currentAddedProduct.max_production;
      let maxProduction = "";

      for (let i = 0; i < maxProductionArray.length; i++) {
        if (difDays == i) {
          maxProduction = maxProductionArray[i];
        }
      }
      this.setState({
        maxProduction: maxProduction,
      });
    };
    const openProductModal = () => {
      this.setState({ modalOpen: !this.state.modalOpen });
    };

    const selectedLocationHandler = () => {
      let locationNameText = document.querySelector(".location-name span");
      let selectedLocation = this.state.currentAddedLocation;
      console.log(this.state.currentMaxDist);
      console.log(selectedLocation);
      if (selectedLocation) {
        locationNameText.innerText = selectedLocation.name;
        locationNameText.classList.add("selected");
        locationNameText.classList.remove("not-selected");
        document.getElementById("unitCount").disabled = false;
      } else {
        locationNameText.innerText = "Please select a Place";
        locationNameText.classList.remove("selected");
        locationNameText.classList.add("not-selected");
      }
    };
    const locationClicked = (id) => {
      console.log(id);
      let locationID = locations.findIndex((el) => el.id === id);
      let selectedLocationDetails = locations[locationID];
      let locationMaxDist = selectedLocationDetails.max_dist;
      this.setState(
        {
          currentAddedLocation: locations[locationID],
          modalOpen: !this.state.modalOpen,
          currentMaxDist: locationMaxDist,
        },
        selectedLocationHandler
      );
    };

    const selectedProductHandler = () => {
      let selectedProductValue = document.querySelector("#select-product")
        .value;

      if (selectedProductValue && selectedProductValue !== "Please select") {
        let productIndex = products.findIndex(
          (el) => el.name === selectedProductValue
        );
        datePicker.disabled = false;
        this.setState({ currentAddedProduct: products[productIndex] });
      } else {
        this.setState({ currentAddedProduct: [] });
        datePicker.disabled = true;
      }
    };

    const calcCost = () => {
      let maxDistValue = this.state.currentMaxDist;
      let unitCount = document.getElementById("unitCount");
      let unitCost = document.getElementById("unitCost");

      let unitCountValue = unitCount.value;
      let selectedProduct = this.state.currentAddedProduct;
      let selectedLocation = this.state.currentAddedLocation;
      let selectedDate = datePicker.value;
      let productUnitCost = selectedProduct.price_per_unit * unitCountValue;
      let shippingFee = selectedLocation.fee;
      let lineCost = productUnitCost + shippingFee;
        
      if (
        maxDistValue &&
        unitCountValue <= maxDistValue &&
        unitCountValue >= 0
      ) {
        unitCost.value = lineCost;

        this.setState(
          { currentLineCost: lineCost, 
            currentUnitCount: unitCountValue },
          preFinalChecks
        );
      } else {
        unitCountValue = maxDistValue;
        unitCount.value = unitCountValue;
        selectedProduct = this.state.currentAddedProduct;
        selectedLocation = this.state.currentAddedLocation;
        selectedDate = datePicker.value;
        productUnitCost = selectedProduct.price_per_unit * unitCountValue;
        shippingFee = selectedLocation.fee;
        lineCost = productUnitCost + shippingFee;
        unitCost.value = lineCost;
        toggleAddBtn(false)
        this.setState(
          { currentLineCost: lineCost, currentUnitCount: unitCountValue },
          alert(
            `You can order up to ${maxDistValue} for distribution on this day`
          ),
          preFinalChecks
        );
      }
    };

    const preFinalChecks = () => {
      let product = this.state.currentAddedProduct;
      let date = this.state.currentAddedDate;
      let place = this.state.currentAddedLocation;
      let lineCost = this.state.currentLineCost;
      let unitCountValue = this.state.currentUnitCount
      if (unitCountValue && unitCountValue ==0){
        unitCountValue = false
      }
      let status = false;
      if (product && date && place && lineCost && unitCountValue ) {
        status = true;
      } else {
        status = false;
      }
      toggleAddBtn(status);
    };

    const toggleAddBtn = (status) => {
      let addBtn = document.getElementById("addBtn");

      if (status == true) {
        console.log('not disabled')
        addBtn.disabled = false;
        addBtn.onclick = addItemstoCart;
        addBtn.classList.add("btn-success");
        addBtn.classList.remove("btn-secondary");
      } else {
        console.log('now disabled')
        addBtn.disabled = true;
        addBtn.onclick = null;
        addBtn.classList.add("btn-secondary");
        addBtn.classList.remove("btn-success");
      }
    };
    let productsTable = document.querySelector("#productsTable tbody");
    const addItemstoCart = () => {
      let product = this.state.currentAddedProduct;
      let date = this.state.currentAddedDate;
      let place = this.state.currentAddedLocation;
      let lineCost = this.state.currentLineCost;
      let unitCount = this.state.currentUnitCount;
      let productInfo = [
        date,
        product.name,
        place.name,
        unitCount,
        lineCost,
        "X",
      ];

      let newProductAddedTR = document.createElement("tr");
      newProductAddedTR.id = `product${product.id}`;
      // newProductAddedTR.onclick = removeSelectedProduct.bind(this,product.id)
      productsTable.append(newProductAddedTR);
      let allInfo = productInfo.map((info) => {
        let td = document.createElement("td");
        td.innerHTML = `<span>${info}</span>`;
        if (info === "X") {
          td.classList.add("removeBtn");
          td.onclick = removeSelectedProduct.bind(null, newProductAddedTR.id);
        }
        newProductAddedTR.append(td);
      });

      clearSelectedValues();
    };

    const clearSelectedValues = () => {
      toggleAddBtn(false);
      this.setState({
        currentAddedLocation: "",
        currentAddedProduct: [],
        currentAddedDate: "",
        daysDifference: "",
        maxProduction: "",
        currentMaxDist: "",
        currentLineCost: "",
      });
    };

    const removeSelectedProduct = (id) => {
      let productToRemove = document.getElementById(id);
      productToRemove.remove();
    };
    return (
      <CRow>
        <CCol xs="12" md="12">
          <CCard>
            <CCardHeader>
              Product Distribution
              <small> Calculator</small>
            </CCardHeader>
            <CCardBody>
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

              <CFormGroup row>
                <CCol md="3">
                  <CLabel className="" htmlFor="date-input">
                    Date Input
                  </CLabel>
                </CCol>
                <CCol xs="12" md="4">
                  <CInput
                    type="date"
                    id="date-input"
                    name="date-input"
                    placeholder="date"
                    className={this.state.datePickerClass}
                    onBlur={setSelectedDate}
                    title="you can select up to 7 days in advance."
                    min={this.state.tomorrowDate}
                    max={this.state.next7Days}
                    disabled
                  />
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel className="noMob" htmlFor="date-input">
                    Location
                  </CLabel>
                </CCol>
                {/* clickable location added */}
                <CCol xs="12" md="2">
                  <CLabel className="place-list-h" htmlFor="date-input">
                    Place
                  </CLabel>
                  <CLabel
                    id="location-name"
                    className="location-name"
                    htmlFor="text-input"
                  >
                    <span> Please select a Place </span>
                  </CLabel>
                </CCol>
                {/* /clickable location added */}
                {/* unit Count */}

                <CCol xs="12" md="2">
                  <CLabel className="place-list-h" htmlFor="unit-count">
                    Unit Count
                  </CLabel>
                  <CInput
                    id="unitCount"
                    name="units"
                    placeholder="Units"
                    

                    type="number"
                    onChange={calcCost}
                    max={this.state.currentMaxDist}
                    min="1"
                    disabled
                  />
                </CCol>
                {/* /unit Count */}
                {/* /units cost */}
                <CCol xs="12" md="2">
                  <CLabel className="place-list-h" htmlFor="date-input">
                    Cost
                  </CLabel>
                  <CInput
                    id="unitCost"
                    name="cost"
                    placeholder="Units"
                    type="number"
                    disabled
                  />
                </CCol>
                {/* /units Cost */}
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3"></CCol>

                <CCol xs="12" md="4">
                  <button
                    type="button"
                    id="addBtn"
                    className="btn btn-square btn-secondary "
                    disabled
                  >
                    Add to Cart
                  </button>
                </CCol>
              </CFormGroup>
              <CRow>
                {/* tables */}

                <CCardBody>
                  <div className="table-responsive">
                    <table id="productsTable" className="table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Product Name</th>
                          <th scope="col">Location</th>
                          <th scope="col">Unit Count</th>
                          <th scope="col">Cost</th>
                          <th scope="col">Remove</th>
                        </tr>
                      </thead>

                      <tbody></tbody>
                    </table>
                  </div>
                </CCardBody>
              </CRow>

              <CModal
                id="ProductModal"
                show={this.state.modalOpen}
                onClose={openProductModal}
                size="xl"
              >
                <CModalHeader closeButton>
                  <CModalTitle>Hover on location to see details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                  {this.state.modalOpen ? (
                    <Map locations={locations} clicked={locationClicked} />
                  ) : (
                    ""
                  )}
                </CModalBody>
              </CModal>

              {/* 
              <CForm
                action=""
                method="post"
                encType="multipart/form-data"
                className="form-horizontal"
              >
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Static</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <p className="form-control-static">Username</p>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="text-input">Text Input</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput
                      id="text-input"
                      name="text-input"
                      placeholder="Text"
                    />
                    <CFormText>This is a help text</CFormText>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="email-input">Email Input</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput
                      type="email"
                      id="email-input"
                      name="email-input"
                      placeholder="Enter Email"
                      autoComplete="email"
                    />
                    <CFormText className="help-block">
                      Please enter your email
                    </CFormText>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="password-input">Password</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput
                      type="password"
                      id="password-input"
                      name="password-input"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                    <CFormText className="help-block">
                      Please enter a complex password
                    </CFormText>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="date-input">Date Input</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput
                      type="date"
                      id="date-input"
                      name="date-input"
                      placeholder="date"
                    />
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="disabled-input">Disabled Input</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput
                      id="disabled-input"
                      name="disabled-input"
                      placeholder="Disabled"
                      disabled
                    />
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="textarea-input">Textarea</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CTextarea
                      name="textarea-input"
                      id="textarea-input"
                      rows="9"
                      placeholder="Content..."
                    />
                  </CCol>
                </CFormGroup>

                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="selectLg">Select Large</CLabel>
                  </CCol>
                  <CCol xs="12" md="9" size="lg">
                    <CSelect custom size="lg" name="selectLg" id="selectLg">
                      <option value="0">Please select</option>
                      <option value="1">Option #1</option>
                      <option value="2">Option #2</option>
                      <option value="3">Option #3</option>
                    </CSelect>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="selectSm">Select Small</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CSelect custom size="sm" name="selectSm" id="SelectLm">
                      <option value="0">Please select</option>
                      <option value="1">Option #1</option>
                      <option value="2">Option #2</option>
                      <option value="3">Option #3</option>
                      <option value="4">Option #4</option>
                      <option value="5">Option #5</option>
                    </CSelect>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="disabledSelect">Disabled Select</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CSelect
                      custom
                      name="disabledSelect"
                      id="disabledSelect"
                      disabled
                      autoComplete="name"
                    >
                      <option value="0">Please select</option>
                      <option value="1">Option #1</option>
                      <option value="2">Option #2</option>
                      <option value="3">Option #3</option>
                    </CSelect>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Radios</CLabel>
                  </CCol>
                  <CCol md="9">
                    <CFormGroup variant="checkbox">
                      <CInputRadio
                        className="form-check-input"
                        id="radio1"
                        name="radios"
                        value="option1"
                      />
                      <CLabel variant="checkbox" htmlFor="radio1">
                        Option 1
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox">
                      <CInputRadio
                        className="form-check-input"
                        id="radio2"
                        name="radios"
                        value="option2"
                      />
                      <CLabel variant="checkbox" htmlFor="radio2">
                        Option 2
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox">
                      <CInputRadio
                        className="form-check-input"
                        id="radio3"
                        name="radios"
                        value="option3"
                      />
                      <CLabel variant="checkbox" htmlFor="radio3">
                        Option 3
                      </CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Inline Radios</CLabel>
                  </CCol>
                  <CCol md="9">
                    <CFormGroup variant="custom-radio" inline>
                      <CInputRadio
                        custom
                        id="inline-radio1"
                        name="inline-radios"
                        value="option1"
                      />
                      <CLabel variant="custom-checkbox" htmlFor="inline-radio1">
                        One
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="custom-radio" inline>
                      <CInputRadio
                        custom
                        id="inline-radio2"
                        name="inline-radios"
                        value="option2"
                      />
                      <CLabel variant="custom-checkbox" htmlFor="inline-radio2">
                        Two
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="custom-radio" inline>
                      <CInputRadio
                        custom
                        id="inline-radio3"
                        name="inline-radios"
                        value="option3"
                      />
                      <CLabel variant="custom-checkbox" htmlFor="inline-radio3">
                        Three
                      </CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Checkboxes</CLabel>
                  </CCol>
                  <CCol md="9">
                    <CFormGroup variant="checkbox" className="checkbox">
                      <CInputCheckbox
                        id="checkbox1"
                        name="checkbox1"
                        value="option1"
                      />
                      <CLabel
                        variant="checkbox"
                        className="form-check-label"
                        htmlFor="checkbox1"
                      >
                        Option 1
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox" className="checkbox">
                      <CInputCheckbox
                        id="checkbox2"
                        name="checkbox2"
                        value="option2"
                      />
                      <CLabel
                        variant="checkbox"
                        className="form-check-label"
                        htmlFor="checkbox2"
                      >
                        Option 2
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox" className="checkbox">
                      <CInputCheckbox
                        id="checkbox3"
                        name="checkbox3"
                        value="option3"
                      />
                      <CLabel
                        variant="checkbox"
                        className="form-check-label"
                        htmlFor="checkbox3"
                      >
                        Option 3
                      </CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Inline Checkboxes</CLabel>
                  </CCol>
                  <CCol md="9">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox
                        custom
                        id="inline-checkbox1"
                        name="inline-checkbox1"
                        value="option1"
                      />
                      <CLabel
                        variant="custom-checkbox"
                        htmlFor="inline-checkbox1"
                      >
                        One
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox
                        custom
                        id="inline-checkbox2"
                        name="inline-checkbox2"
                        value="option2"
                      />
                      <CLabel
                        variant="custom-checkbox"
                        htmlFor="inline-checkbox2"
                      >
                        Two
                      </CLabel>
                    </CFormGroup>
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox
                        custom
                        id="inline-checkbox3"
                        name="inline-checkbox3"
                        value="option3"
                      />
                      <CLabel
                        variant="custom-checkbox"
                        htmlFor="inline-checkbox3"
                      >
                        Three
                      </CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CLabel col md="3" htmlFor="file-input">
                    File input
                  </CLabel>
                  <CCol xs="12" md="9">
                    <CInputFile id="file-input" name="file-input" />
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>Multiple File input</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInputFile
                      id="file-multiple-input"
                      name="file-multiple-input"
                      multiple
                      custom
                    />
                    <CLabel htmlFor="file-multiple-input" variant="custom-file">
                      Choose Files...
                    </CLabel>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CLabel col md={3}>
                    Custom file input
                  </CLabel>
                  <CCol xs="12" md="9">
                    <CInputFile custom id="custom-file-input" />
                    <CLabel htmlFor="custom-file-input" variant="custom-file">
                      Choose file...
                    </CLabel>
                  </CCol>
                </CFormGroup>
              </CForm> */}
            </CCardBody>
            <CCardFooter>
              <CButton type="submit" size="sm" color="primary">
                <CIcon name="cil-scrubber" /> Submit
              </CButton>
              <CButton type="reset" size="sm" color="danger">
                <CIcon name="cil-ban" /> Reset
              </CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    );
  }
}

export default Dashboard;
