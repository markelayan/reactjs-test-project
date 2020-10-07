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
      currentAddedLocation: "",
      currentAddedProduct: [],
      todayDate: "",
      currentAddedDate: "",
      tomorrowDate: "",
      next7Days: "",
      daysDifference: "",
      maxProduction: "",
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
        }
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
    const fields = ["Place", "unites", "cost ", "status"];
    const getBadge = (status) => {
      switch (status) {
        case "Active":
          return "success";
        case "Inactive":
          return "secondary";
        case "Pending":
          return "warning";
        case "Banned":
          return "danger";
        default:
          return "primary";
      }
    };

    let products = this.state.products;
    let productNames = products.map((product) => product.name);
    productNames.unshift("Please select");
    let locations = this.state.locations;
    let datePicker = document.getElementById("date-input");

    const setSelectedDate = () => {
      let selectedDate = datePicker.value;
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
    const addProduct = () => {
      this.setState({ modalOpen: !this.state.modalOpen });
    };

    const selectedLocationHandler = () => {
      let locationNameText = document.querySelector(".location-name span");
      let selectedLocation = this.state.currentAddedLocation;
      console.log(selectedLocation);
      if (selectedLocation) {
        locationNameText.innerText = selectedLocation.name;
        locationNameText.classList.add("selected");
      } else {
        locationNameText.innerText = "Please select a Place";
        locationNameText.classList.remove("selected");
      }
    };
    const locationClicked = (id) => {
      console.log(id);
      let locationID = locations.findIndex((el) => el.id === id);

      this.setState(
        {
          currentAddedLocation: locations[locationID],
          modalOpen: !this.state.modalOpen,
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
      let selectedProduct = this.state.currentAddedProduct;
      let selectedLocation = this.state.currentAddedLocation;
      let unitCount = document.getElementById("unitCount").value;
      let productUnitCost = selectedProduct.price_per_unit * unitCount;
      let shippingFee = selectedLocation.fee;
      let lineCost = productUnitCost + shippingFee;
      let selectedDate = datePicker.value;

      document.getElementById("unitCost").value = lineCost;
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
                    onChange={setSelectedDate}
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
                    className="location-name"
                    htmlFor="text-input"
                    onClick={addProduct}
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
                    max="0"
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
                    className="btn btn-square btn-success"
                    onClick={addProduct}
                  >
                    Add to List
                  </button>
                </CCol>
              </CFormGroup>
              <CRow>
                {/* tables */}

                <CCardBody>
                  <CDataTable
                    items={usersData}
                    fields={fields}
                    itemsPerPage={5}
                    scopedSlots={{
                      status: (item) => (
                        <td>
                          <CBadge color={getBadge(item.status)}>
                            {item.status}
                          </CBadge>
                        </td>
                      ),
                    }}
                  />
                </CCardBody>
              </CRow>

              <CModal
                id="ProductModal"
                show={this.state.modalOpen}
                onClose={addProduct}
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
