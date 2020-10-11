import React, { Component } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CFormGroup,
  CInput,
  CLabel,
  CRow,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";
import axios from "axios";
import CIcon from "@coreui/icons-react";
import Map from "./Maps";
import DataTable from "./DataTable";
import Products from "./Products"

const PRODUCT_API = "https://5efabb3a80d8170016f758ee.mockapi.io/products";
const LOCATIONS_API = "https://5efabb3a80d8170016f758ee.mockapi.io/locations";
const CART_API = "https://5efabb3a80d8170016f758ee.mockapi.io/cart";
const ENABLED = "enabled";
const DISABLED = " disabled";

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
      daysDifference: 0,
      maxProduction: 0,
      currentMaxDist: 0,
      currentLineCost: 0,
      CartElements: [],
      currentUnitCount: 0,
      totalUnits: 0,
      totalCost: 0,
      productElements: [],
      cartProduct: [],
      cartLocations: [],
      canSubmit: false,
      canReset: false,
    };
  }

  setupDate() {
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

  getProducts() {
    axios
      .get(PRODUCT_API)
      .then((res) => {
        const products = res.data;
        this.setState({
          products: products,
        });
      })
      .catch((error) => {
        if (error.response) {
          alert(
            `Sorry, There was an error in the products server and application won\'t function \n${error.response.data} \n${error.response.status}`
          );
        } else if (error.request) {
          alert("Sorry, There was an error in the products server and application won't function");
        } else {
        }
      });
  }

  getLocations() {
    axios.get(LOCATIONS_API)
      .then((res) => {
        let locations = res.data;

        locations = locations.map((location) => {
          location.status = true;
          return location;
        });
        this.setState({
          isLoaded: true,
          locations: locations,
        });
      })
      .catch((error) => {
        if (error.response) {
          alert(
            `Sorry, There was an error in the locations server and application won\'t function \n${error.response.data} \n${error.response.status}`
          );
        } else if (error.request) {
          alert("Sorry, There was an error in the locations server and application won't function");
        } else {
        }
      });
  }

  componentDidMount() {
    this.getProducts();

    this.getLocations();

    this.setupDate();
  }

  render() {
    // global variables introduction

    const isLoaded = this.state.isLoaded;
    let locations = this.state.locations;
    let products = this.state.products;

    let datePicker = document.getElementById("date-input");
    const locationNameHolder = document.getElementById("location-name");
    const unitCountInput = document.getElementById("unitCount");
    let productSelect = document.querySelector("#select-product");
    let locationNameText = document.querySelector(".location-name span");

    let fields = ["Date", "Product", "Place", "units", "cost ", "Remove"];
    let productElements = this.state.productElements;

    // global variables introduction ended

    const selectedProductHandler = (obj) => {
      let productID = obj.target.value; 
      if (!productID == 0) {
        let productIndex = products.findIndex((el) => el.id === productID);
        toggleDatePicker(ENABLED);
        this.setState({ currentAddedProduct: products[productIndex] });
      } else {
        toggleDatePicker(DISABLED);
        this.setState({ currentAddedProduct: [] });
      }
    }; // log selected product to state using product ID from event object

    const setSelectedDate = () => {
      let tomorrowDate = this.state.tomorrowDate;
      let selectedDate = datePicker.value;
      let lastAvailablDate = this.state.next7Days;
      if (selectedDate < tomorrowDate || selectedDate > lastAvailablDate) {
        datePicker.value = tomorrowDate;
        alert(`you can select dates between ${tomorrowDate} and ${lastAvailablDate} only`);
        this.setState({
            currentAddedDate: datePicker.value,
          },calculateDates);
      } else {
        this.setState({
            currentAddedDate: selectedDate,
          },calculateDates);
      }
    }; // verify selected date not before tomorrow and not after 1 week then set to state

    const calculateDates = () => {
      let today = new Date(this.state.todayDate);
      let selected = new Date(this.state.currentAddedDate);
      let difference = selected - today;
      const diffDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
      this.setState({ 
        daysDifference: diffDays 
        },togglePlaceNameHolder(ENABLED));
    }; // calculate date difference between today and selected date and set it to state

    const openProductModal = () => {
      this.setState({ modalOpen: !this.state.modalOpen });
    }; // open product locations modal

    const locationClicked = (id) => {
      let locationID = locations.findIndex((el) => el.id === id);
      let selectedLocationDetails = locations[locationID];
      let locationMaxDist = selectedLocationDetails.max_dist;
      let maxDist = calculateMaxOrder(locationMaxDist);
      this.setState({
          currentAddedLocation: locations[locationID],
          modalOpen: !this.state.modalOpen,
          currentMaxDist: maxDist,
        },selectedLocationHandler);
    }; // get location by location ID sent from binded function sent from modal
      // then get location details and set it in the current location state along with max order

      const selectedLocationHandler = (status) => {
        let locationNameText = document.querySelector(".location-name span");
        let selectedLocation = this.state.currentAddedLocation;
  
        if (selectedLocation || status == true) {
          toggleProductSelect(DISABLED);
          toggleDatePicker(DISABLED);
          locationNameText.innerText = selectedLocation.name;
          locationNameText.classList.add("selected");
          locationNameText.classList.remove("not-selected");
          toggleUnitCountInput(ENABLED);
        } else {
          toggleProductSelect(ENABLED);
          toggleDatePicker(ENABLED);
          locationNameText.innerText = "Please select a Place";
          locationNameText.classList.remove("selected");
          locationNameText.classList.add("not-selected");
          toggleUnitCountInput(DISABLED);
        }
      }; // toggle location and date picker if location clicked

    const calculateMaxOrder = (locationMaxDist) => {
      let difDays = this.state.daysDifference;
      let maxProductionArray = this.state.currentAddedProduct.max_production;
      let totalUnitsOrdered = calculateNewTotalUnits();
      let maxProd = 0;
      let maxDist = 0;
      for (let i = 0; i < Object.keys(maxProductionArray).length; i++) {
        if (difDays == i) {
          maxProd = maxProductionArray[i];
        } else if (difDays > i) {
          maxProd = maxProductionArray[i];
        }
      }
      let availaToOrder = maxProd - totalUnitsOrdered;
      if (availaToOrder > locationMaxDist) {
        maxDist = locationMaxDist;
      } else {
        maxDist = availaToOrder;
      }
      return maxDist;
    }; //calculate max distribution value based on # days difference
      // then get available to order value by subtracting product max production
      // and total units already ordered, then set max distribution based on that value.

    const calcCost = () => {
      let maxDistValue = this.state.currentMaxDist;
      let unitCountValue = unitCountInput.value;
      let selectedProduct = this.state.currentAddedProduct;
      let selectedLocation = this.state.currentAddedLocation;
      let selectedDate = this.state.currentAddedDate;

      let productUnitCost = selectedProduct.price_per_unit * unitCountValue;
      let shippingFee = selectedLocation.fee;
      let lineCost = productUnitCost + shippingFee;

      if (maxDistValue && unitCountValue <= maxDistValue && unitCountValue >= 0 ) {
        toggleAddBtn(ENABLED);
        this.setState({
          currentLineCost: lineCost,
          currentUnitCount: unitCountValue,
        });
      } else {
        unitCountValue = maxDistValue;
        unitCountInput.value = unitCountValue;
        selectedProduct = this.state.currentAddedProduct;
        selectedLocation = this.state.currentAddedLocation;
        selectedDate = datePicker.value;
        productUnitCost = selectedProduct.price_per_unit * unitCountValue;
        shippingFee = selectedLocation.fee;
        lineCost = productUnitCost + shippingFee;
        toggleAddBtn(ENABLED);
        this.setState(
          { currentLineCost: lineCost, currentUnitCount: unitCountValue },
          alert(`You can order up to ${maxDistValue} for distribution on this day`)
        );
      }
    }; //calculate this order cost based on shipping fee and product unit cost and product unit count
      // if product unit count is more than available then set max available and calculate on that

    const calculateNewTotalUnits = () => {
      let currentCount = 0;
      productElements.forEach((u) => {
        currentCount += parseInt(u.currentUnitCount);
      });
      return currentCount;
    }; // calculate added products count

    const calculateNewTotalCost = () => {
      let currentCost = 0;
      productElements.forEach((u) => {
        currentCost += parseFloat(u.lineCost);
      });

      return currentCost;
    }; //calculate added products cost (only unit cost)

    const updateTotals = () => {
      let newTotalUnits = calculateNewTotalUnits();
      let newTotalCost = calculateNewTotalCost();

      this.setState({
        totalCost: newTotalCost,
        totalUnits: newTotalUnits,
      });
    }; // update total cost and total units ordered

    const addItemstoCart = () => {
      let product = this.state.currentAddedProduct;
      let place = this.state.currentAddedLocation;
      let date = this.state.currentAddedDate;
      let lineCost = this.state.currentLineCost;
      let currentUnitCount = this.state.currentUnitCount;
      let cartProductsInfo = this.state.cartProduct;
      let cartLocations = this.state.cartLocations;
      let productName = product.name;
      let placeName = place.name;

      toggleLocationFromMap(place.id, "remove"); // disabled location from re-ordering

      let productInfo = {
        date: date,
        productName: productName,
        placeName: placeName,
        currentUnitCount: currentUnitCount,
        lineCost: lineCost,
        remove: "X",
        placeID: place.id,
      };
      addNewProductElement(productInfo, place.id);
      togglePlaceNameHolder(ENABLED);
      updateTotals();

      cartLocations.push({ id: place.id, quantity: currentUnitCount });

      if (cartProductsInfo.length == 0) {
        this.setState({
            cartLocations: cartLocations,
            cartProduct: [{ date: date, product: product.id }],
            canSubmit: true,
            canReset: true
          },prepareAnotherProduct);
      } else {
        this.setState({
            cartLocations: cartLocations,
            canSubmit: true,
            canReset: true
          },prepareAnotherProduct);
      }
    };

    const addNewProductElement = (productInfo) => {
      this.state.productElements.push(productInfo);
    }; // add new product to cart in state when called from addItemstoCart

    const toggleLocationFromMap = (id, act) => {
      if (id === "all") {
        locations = locations.map((location) => {
          location.status = true;
          return location;
        });
        this.setState({
          locations: locations,
        });
      } else {
        if (act === "remove") {
          locations = locations.map((location) => {
            if (location.id == id) {
              location.status = false;
              return location;
            } else {
              return location;
            }
          });
          this.setState({
            locations: locations,
          });
        } else {
          locations = locations.map((location) => {
            if (location.id == id) {
              location.status = true;
              return location;
            } else {
              return location;
            }
          });
          this.setState({
            locations: locations,
          });
        }
      }
    }; // called to toggle enable / disable location in product locations map

    const prepareAnotherProduct = () => {
      toggleProductSelect(DISABLED);

      toggleDatePicker(DISABLED);

      togglePlaceNameHolder();

      toggleUnitCountInput(DISABLED);
      unitCountInput.value = "";

      toggleAddBtn(DISABLED);
      this.setState({
        currentAddedLocation: "",
        currentLineCost: 0,
      });
    }; // called to reset fields and state to add another location to order

    const confirmReset = () => {
      let askFirst = window.confirm("Resetting will delete all cart details");
      if (askFirst == true) {
        clearSelectedValues();
      } else {
        return
      }
    }; // ask to confirm reset cart if reset button clicked

    const clearSelectedValues = () => {
      toggleProductSelect(ENABLED);
      productSelect.selectedIndex = 0;

      toggleDatePicker(DISABLED);
      datePicker.value = "";

      togglePlaceNameHolder(DISABLED);
      toggleUnitCountInput(DISABLED);
      unitCountInput.value = "";

      toggleAddBtn(DISABLED);
      productElements = [];
      toggleLocationFromMap("all"); // enable all locations
      this.setState(
        {
          currentAddedLocation: "",
          currentAddedProduct: [],
          currentAddedDate: "",
          daysDifference: 0,
          maxProduction: 0,
          currentMaxDist: 0,
          currentLineCost: 0,
          CartElements: [],
          cartProduct: [],
          cartLocations: [],
          currentUnitCount: 0,
          totalUnits: 0,
          totalCost: 0,
          productElements: [],
          canSubmit:false,
          canReset:false
        },
        updateTotals
      );
    }; // reset application to first state

    const removeSelectedProduct = (i, id) => {
      this.state.productElements.splice(i, 1);
      updateTotals();
      toggleLocationFromMap(id, "enable");
      let newMaxOrder = calculateMaxOrder();
      this.setState({
        currentMaxDist: newMaxOrder,
      });
    }; // remove product if remove clicked and update totals

    const postToCart = () => {
      let cartProduct = this.state.cartProduct;
      let cartLocations = this.state.cartLocations;
      let locationsObj = { locations: cartLocations };
      let postObj = Object.assign(cartProduct[0], locationsObj);
      toggleLoadSpinner(ENABLED);
      axios
        .post(CART_API, { postObj })
        .then((res) => {
          clearSelectedValues();
          toggleLoadSpinner(DISABLED);
          this.props.history.push("/ThankYou");
        })
        .catch((error) => {
          toggleLoadSpinner(DISABLED);
          alert("There was an error!", error.message);
        });
    }; // prepare cart details and send to post and change page to Thank you page

        // toggelers

    const toggleLoadSpinner = (status) => {
      let loadSpinner = document.getElementById("loadSpinner");
      if (status == ENABLED) {
        loadSpinner.classList = "visible";
      } else if (status == DISABLED) {
        loadSpinner.classList = "";
      }
    }; // toggle loading spinner

    const toggleProductSelect = (status) => {
      if (status === ENABLED) {
        productSelect.disabled = false;
      } else if (status === DISABLED) {
        productSelect.disabled = true;
      }
    }; // toggle product select field

    const toggleDatePicker = (status) => {
      if (status === ENABLED) {
        datePicker.disabled = false;
      } else if (status === DISABLED) {
        datePicker.disabled = true;
      }
    };// toggle date picker field

    const togglePlaceNameHolder = (status) => {
      if (status === ENABLED) {
        datePicker.disabled = false;
        locationNameText.innerText = "Please select a Place";
        locationNameText.classList = "not-selected";
        locationNameHolder.onclick = openProductModal;
      } else if (status === DISABLED) {
        locationNameText.innerText = "Please select a Place";
        locationNameText.classList = "";
      }
    };// toggle location modal field

    const toggleUnitCountInput = (status) => {
      if (status === ENABLED) {
        unitCountInput.disabled = false;
      } else if (status === DISABLED) {
        unitCountInput.disabled = true;
      }
    };

    const toggleAddBtn = (status) => {
      let addBtn = document.getElementById("addBtn");

      if (status == ENABLED) {
        addBtn.disabled = false;
        addBtn.onclick = addItemstoCart;
        addBtn.classList.add("btn-success");
        addBtn.classList.remove("btn-secondary");
      } else if (status == DISABLED) {
        addBtn.disabled = true;
        addBtn.onclick = null;
        addBtn.classList.add("btn-secondary");
        addBtn.classList.remove("btn-success");
      }
    }; // toggle add to Cart button and add event listener

    // toggelers end

    if (isLoaded) {
      toggleLoadSpinner(DISABLED);
    }
    return (
      <CRow>
        <CCol xs="12" md="12">
          <CCard>
            <CCardHeader>
              Product Distribution
              <small> Calculator</small>
            </CCardHeader>
            <CCardBody>
            <Products products={this.state.products} click={selectedProductHandler}></Products>
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
                {/* /clickable location  */}
                {/* Locations Modal*/}
                <CModal
                id="ProductModal"
                show={this.state.modalOpen}
                onClose={openProductModal}
                size="xl"
              >
                <CModalHeader closeButton>
                  <CModalTitle>Available locations</CModalTitle>
                </CModalHeader>
                <CModalBody>
                  {this.state.modalOpen ? (
                    <Map
                      locations={this.state.locations}
                      clicked={locationClicked}
                    />
                  ) : (
                    ""
                  )}
                </CModalBody>
              </CModal>
                {/* unit Count */}

                <CCol xs="12" md="2">
                  <CLabel className="place-list-h" htmlFor="unit-count">
                    Unit Count
                  </CLabel>
                  <div id="00">
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
                  </div>
                </CCol>
                {/* /unit Count */}
                {/* units cost */}
                <CCol xs="12" md="2">
                  <CLabel className="place-list-h" htmlFor="date-input">
                    Cost
                  </CLabel>
                  <CInput
                    id="unitCost"
                    name="cost"
                    placeholder="Units"
                    type="number"
                    value={this.state.currentLineCost}
                    disabled
                  />
                </CCol>
              </CFormGroup>
              {/* /units Cost */}
              {/* Add Button */}
              <CFormGroup row>
                <CCol md="3"></CCol>

                <CCol xs="12" md="2" className="mr-2">
                  <button
                    type="button"
                    id="addBtn"
                    className="btn btn-square btn-secondary "
                    disabled
                  >
                    Add to Cart
                  </button>
                </CCol>
                <CCol xs="12" md="2"></CCol>
              </CFormGroup>
              <CRow>
                {/* tables */}

                <DataTable
                  fields={fields}
                  items={productElements}
                  click={removeSelectedProduct}
                ></DataTable>
              </CRow>
              {/* / table */}
              {/* Totals */}
              <CFormGroup row>
                <CCol md="2">
                  <CLabel htmlFor="date-input">
                    <b>Total Units:</b>
                  </CLabel>
                </CCol>
                {/* clickable location added */}
                <CCol xs="12" md="2">
                  <CLabel>{this.state.totalUnits}</CLabel>
                </CCol>
                {/* /clickable location added */}
              </CFormGroup>
              <CFormGroup row>
                <CCol md="2">
                  <CLabel htmlFor="date-input">
                    <b>Total Cost:</b>
                  </CLabel>
                </CCol>
                {/* clickable location added */}
                <CCol xs="12" md="2">
                  <CLabel>{this.state.totalCost}</CLabel>
                </CCol>
                {/* /clickable location added */}
              </CFormGroup>
              {/* Totals */}
              
            </CCardBody>
            <CCardFooter>
              <CButton
                type="submit"
                size="sm"
                color="primary"
                onClick={postToCart}
                disabled={!this.state.canSubmit}
              >
                <CIcon name="cil-scrubber" /> Submit
              </CButton>
              <CButton
                type="reset"
                size="sm"
                color="danger"
                onClick={confirmReset}
                disabled={!this.state.canReset}
              >
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
