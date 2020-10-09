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
  CSelect,
  CRow,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import Map from "./Maps";

const PRODUCT_API ="https://5efabb3a80d8170016f758ee.mockapi.io/products";

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
      cartProduct: [],
      cartLocations: [],
      totalUnits: 0,
      totalCost: 0,
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

    fetch("https://5efabb3a80d8170016f758ee.mockapi.io/locations")
      .then((loc) => loc.json())
      .then(
        (locations) => {
          locations = locations.map((location) => {
                  location.status = "enabled";
                  return location
                });
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
        
      );
   
    this.setupDate()
   

  }
//    setupLocations  ()  {
//     let locations = this.state.locations;
//     locations = locations.map((location) => {
//       location.status = "enabled";
//       return location
//     });
//     this.setState({
//       locations : locations
//     })
// }

  render() {

    // global variables introduction 

    let fields = ["Date", "Product", "Place", "units", "cost ", "Remove"];
    const { isLoaded } = this.state;




    // global variables introduction ended

    
    

    fields = fields.map((field,i)=> (<th key= {i} scope="col">{field}</th>)) 
    let locations = this.state.locations;
    let products = this.state.products;
    let productNames = products.map((product) => product.name);
    productNames.unshift("Please select");
    

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
    const locationNameHolder = document.getElementById("location-name");
    const calculateMaxOrder = () => {
      locationNameHolder.firstChild.classList.add("not-selected");

      locationNameHolder.onclick = openProductModal;
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

    const unitCountInput = document.getElementById("unitCount");

    const selectedLocationHandler = (status) => {
      let locationNameText = document.querySelector(".location-name span");
      let selectedLocation = this.state.currentAddedLocation;

      if (selectedLocation || status == true) {
        toggleProductSelect(false);
        toggleDatePicker(false);
        locationNameText.innerText = selectedLocation.name;
        locationNameText.classList.add("selected");
        locationNameText.classList.remove("not-selected");
        toggleUnitCountInput(true);
      } else {
        toggleProductSelect(true);
        toggleDatePicker(true);
        locationNameText.innerText = "Please select a Place";
        locationNameText.classList.remove("selected");
        locationNameText.classList.add("not-selected");
        toggleUnitCountInput(false);
      }
    };

    const locationClicked = (id) => {
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
    let productSelect = document.querySelector("#select-product");
    const selectedProductHandler = () => {
      let selectedProductValue = productSelect.value;

      if (selectedProductValue && selectedProductValue !== "Please select") {
        let productIndex = products.findIndex(
          (el) => el.name === selectedProductValue
        );
        toggleDatePicker(true);
        this.setState({ currentAddedProduct: products[productIndex] });
      } else {
        toggleDatePicker(false);
        this.setState({ currentAddedProduct: [] });
      }
    };
    let unitCost = document.getElementById("unitCost");

    const calcCost = () => {
      let maxDistValue = this.state.currentMaxDist;
      let unitCountValue = unitCountInput.value;
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
          { currentLineCost: lineCost, currentUnitCount: unitCountValue },
          preFinalChecks
        );
      } else {
        unitCountValue = maxDistValue;
        unitCountInput.value = unitCountValue;
        selectedProduct = this.state.currentAddedProduct;
        selectedLocation = this.state.currentAddedLocation;
        selectedDate = datePicker.value;
        productUnitCost = selectedProduct.price_per_unit * unitCountValue;
        shippingFee = selectedLocation.fee;
        lineCost = productUnitCost + shippingFee;
        unitCost.value = lineCost;
        toggleAddBtn(false);
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
      let unitCountValue = this.state.currentUnitCount;
      if (unitCountValue && unitCountValue == 0) {
        unitCountValue = false;
      }
      let status = false;
      if (product && date && place && lineCost && unitCountValue) {
        status = true;
      } else {
        status = false;
      }
      toggleAddBtn(status);
    };

    const toggleAddBtn = (status) => {
      let addBtn = document.getElementById("addBtn");

      if (status == true) {
        addBtn.disabled = false;
        addBtn.onclick = addItemstoCart;
        addBtn.classList.add("btn-success");
        addBtn.classList.remove("btn-secondary");
      } else {
        addBtn.disabled = true;
        addBtn.onclick = null;
        addBtn.classList.add("btn-secondary");
        addBtn.classList.remove("btn-success");
      }
    };

    const togglePlaceNameHolder = () => {
      let locationNameText = document.querySelector(".location-name span");
      // toggleProductSelect(true);
      // toggleDatePicker(true);
      locationNameText.innerText = "Please select a Place";
      locationNameText.classList = "not-selected";

      toggleUnitCountInput(false);
    };

    const toggleProductSelect = (status) => {
      if (status) {
        productSelect.disabled = false;
      } else {
        productSelect.disabled = true;
      }
    };
    const toggleDatePicker = (status) => {
      if (status) {
        datePicker.disabled = false;
      } else {
        datePicker.disabled = true;
      }
    };

    const toggleUnitCountInput = (status) => {
      if (status) {
        unitCountInput.disabled = false;
      } else {
        unitCountInput.disabled = true;
      }
    };

    let productsTable = document.querySelector("#productsTable tbody");

    const addItemstoCart = () => {
      let product = this.state.currentAddedProduct;
      let date = this.state.currentAddedDate;
      let place = this.state.currentAddedLocation;
      let lineCost = this.state.currentLineCost;
      let currentUnitCount = this.state.currentUnitCount;
      let cartProductsInfo = this.state.cartProduct;
      let cartLocations = this.state.cartLocations;
      let totalUnits = this.state.totalUnits;
      let totalCost = this.state.totalCost;
      
      removeLocationFromMap(place.id)

      let productInfo = [
        date,
        product.name,
        place.name,
        currentUnitCount,
        lineCost,
        "X",
      ];
      let newTotalUnits = parseInt(totalUnits) + parseInt(currentUnitCount);
      let newTotalCost = parseInt(totalCost) + parseInt(lineCost);

      let newProductAddedTR = document.createElement("tr");
      newProductAddedTR.id = `product${product.id}`;
      productsTable.append(newProductAddedTR);

      productInfo.map((info) => {
        let td = document.createElement("td");
        td.innerHTML = `<span>${info}</span>`;
        if (info === "X") {
          td.classList.add("removeBtn");
          td.onclick = removeSelectedProduct.bind(null, newProductAddedTR.id);
        }
        newProductAddedTR.append(td);
      });

      cartLocations.push({ id: place.id, quantity: currentUnitCount });
      if (cartProductsInfo.length == 0) {
        this.setState(
          {
            totalCost: newTotalCost,
            totalUnits: newTotalUnits,
            cartLocations: cartLocations,
            cartProduct: [{ date: date, product: product.id }],
          },
          prepareAnotherProduct
        );
      } else {
        this.setState(
          {
            totalCost: newTotalCost,
            totalUnits: newTotalUnits,
            cartLocations: cartLocations,
          },
          prepareAnotherProduct
        );
      }
    };

    const removeLocationFromMap =(id) => {
      
      locations = locations.map((location) => {
        
        if(location.id == id){
        location.status = "disabled";
        return location
      } else {
        return location
      }
      });
      this.setState({
        locations: locations
      })
    }

    const prepareAnotherProduct = () => {
      toggleProductSelect(false);

      toggleDatePicker(false);

      togglePlaceNameHolder();
      toggleUnitCountInput(false);
      unitCountInput.value = "";

      unitCost.value = "";
      toggleAddBtn(false);
      this.setState({
        currentAddedLocation: "",
        currentMaxDist: "",
        currentLineCost: "",
      });
    };
    const clearSelectedValues = () => {
      toggleProductSelect(true);
      productSelect.selectedIndex = 0;

      toggleDatePicker(false);
      datePicker.value = "";

      togglePlaceNameHolder();
      toggleUnitCountInput(false);
      unitCountInput.value = "";

      unitCost.value = "";
      toggleAddBtn(false);
      this.setState({
        currentAddedLocation: "",
        currentAddedProduct: [],
        currentAddedDate: "",
        daysDifference: "",
        maxProduction: "",
        currentMaxDist: "",
        currentLineCost: "",
        cartProducts: [],
      });
    };

    const removeSelectedProduct = (id) => {
      let productToRemove = document.getElementById(id);
      productToRemove.remove();
    };

    
    if (isLoaded) {
      document.getElementById("loadSpinner").classList.remove("visible")
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

                <CCardBody>
                  <div className="table-responsive">
                    <table id="productsTable" className="table">
                      <thead>
                        <tr>
                          
                        {fields}
                        </tr>
                      </thead>

                      <tbody></tbody>
                    </table>
                  </div>
                </CCardBody>
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
                  <CLabel id="totalUnits" htmlFor="text-input"></CLabel>
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
                  <CLabel id="totalUnits" htmlFor="text-input"></CLabel>
                </CCol>
                {/* /clickable location added */}
              </CFormGroup>
              {/* Totals */}
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
                    <Map locations={this.state.locations} clicked={locationClicked} />
                  ) : (
                    ""
                  ) }
                </CModalBody>
              </CModal>
            </CCardBody>
            <CCardFooter>
              <CButton type="submit" size="sm" color="primary">
                <CIcon name="cil-scrubber" /> Submit
              </CButton>
              <CButton
                type="reset"
                size="sm"
                color="danger"
                onClick={clearSelectedValues}
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
