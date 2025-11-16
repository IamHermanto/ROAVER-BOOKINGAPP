"use strict";
var RoaverWidget = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/BookingWidget.ts
  var BookingWidget_exports = {};
  __export(BookingWidget_exports, {
    BookingWidget: () => BookingWidget
  });
  var BookingWidget;
  var init_BookingWidget = __esm({
    "src/BookingWidget.ts"() {
      "use strict";
      BookingWidget = class {
        constructor(containerId, config) {
          this.clientConfig = null;
          this.searchResults = [];
          this.currentView = "search";
          this.selectedVehicle = null;
          this.searchParams = null;
          const element = document.getElementById(containerId);
          if (!element) {
            throw new Error(`Container with id "${containerId}" not found`);
          }
          this.container = element;
          this.config = config;
        }
        async init() {
          this.container.innerHTML = `<div style="text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">\u23F3 Loading booking system...</div>`;
          const apiReady = await this.waitForApi();
          if (!apiReady) {
            this.container.innerHTML = `<div style="text-align: center; padding: 40px; color: #ef4444; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">\u274C Unable to connect to booking system. Please try again later.</div>`;
            return;
          }
          await this.loadClientConfig();
          this.applyTheme();
          this.render();
        }
        async waitForApi(retries = 3) {
          for (let i = 0; i < retries; i++) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 1e4);
              const response = await fetch(`${this.config.apiUrl}/health`, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              if (response.ok) {
                console.log("\u2713 API connected");
                return true;
              }
            } catch (error) {
              console.log(`API not ready, attempt ${i + 1}/${retries}...`);
              if (i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, 2e3));
              }
            }
          }
          return false;
        }
        async loadClientConfig() {
          try {
            const response = await fetch(
              `${this.config.apiUrl}/clients/${this.config.clientId}/config`
            );
            const data = await response.json();
            if (data.success) {
              this.clientConfig = data.config;
            }
          } catch (error) {
            console.error("Failed to load client config:", error);
          }
        }
        applyTheme() {
          if (!this.clientConfig) return;
          const style = document.createElement("style");
          style.textContent = `
      .booking-widget {
        --primary-color: ${this.clientConfig.theme.primary_color};
        --secondary-color: ${this.clientConfig.theme.secondary_color};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .booking-widget button.primary {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
      }
      .booking-widget button.primary:hover {
        opacity: 0.9;
      }
      .booking-widget button.secondary {
        background-color: white;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        margin-right: 10px;
      }
      .booking-widget button.secondary:hover {
        background-color: #f9fafb;
      }
      .booking-widget input, .booking-widget select {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        width: 100%;
        box-sizing: border-box;
      }
      .booking-widget .form-group {
        margin-bottom: 16px;
      }
      .booking-widget label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
      }
      .booking-widget .vehicle-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        gap: 16px;
      }
      .booking-widget .vehicle-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .booking-widget .vehicle-info {
        flex: 1;
      }
      .booking-widget .vehicle-price {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
      }
      .booking-widget .vehicle-features {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .booking-widget .feature-badge {
        background: #f3f4f6;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        color: #6b7280;
      }
      .booking-widget .booking-summary {
        background: #f9fafb;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .booking-widget .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .booking-widget .total-price {
        font-size: 20px;
        font-weight: bold;
        color: var(--primary-color);
        border-top: 2px solid #e5e7eb;
        padding-top: 10px;
        margin-top: 10px;
      }
    `;
          document.head.appendChild(style);
        }
        render() {
          this.container.innerHTML = "";
          this.container.className = "booking-widget";
          switch (this.currentView) {
            case "search":
              this.renderSearchForm();
              break;
            case "results":
              this.renderResults();
              break;
            case "booking":
              this.renderBookingForm();
              break;
          }
        }
        renderSearchForm() {
          const form = document.createElement("div");
          form.innerHTML = `
      <h2>Search Campervans</h2>
      <form id="search-form">
        <div class="form-group">
          <label for="pickup-date">Pick Up Date</label>
          <input type="date" id="pickup-date" required />
        </div>
        <div class="form-group">
          <label for="dropoff-date">Drop Off Date</label>
          <input type="date" id="dropoff-date" required />
        </div>
        <div class="form-group">
          <label for="people">Number of People</label>
          <input type="number" id="people" min="1" max="10" value="2" required />
        </div>
        <div class="form-group">
          <label for="transmission">Transmission</label>
          <select id="transmission">
            <option value="">Any</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div class="form-group">
          <label for="vehicle-type">Vehicle Type</label>
          <select id="vehicle-type">
            <option value="">Any</option>
            <option value="campervan">Campervan</option>
            <option value="motorhome">Motorhome</option>
          </select>
        </div>
        <button type="submit" class="primary">Search Vehicles</button>
      </form>
    `;
          this.container.appendChild(form);
          const searchForm = form.querySelector("#search-form");
          searchForm.addEventListener("submit", (e) => this.handleSearch(e));
        }
        async handleSearch(e) {
          e.preventDefault();
          const pickupDate = document.getElementById("pickup-date").value;
          const dropoffDate = document.getElementById("dropoff-date").value;
          const people = document.getElementById("people").value;
          const transmission = document.getElementById("transmission").value;
          const vehicleType = document.getElementById("vehicle-type").value;
          this.searchParams = {
            pickup_date: pickupDate,
            dropoff_date: dropoffDate,
            number_of_people: people
          };
          const params = new URLSearchParams({
            pickup_date: pickupDate,
            dropoff_date: dropoffDate,
            number_of_people: people
          });
          if (transmission) params.append("transmission", transmission);
          if (vehicleType) params.append("vehicle_type", vehicleType);
          try {
            await this.trackQuote(pickupDate, dropoffDate, people);
            const response = await fetch(`${this.config.apiUrl}/vehicles/search?${params}`);
            const data = await response.json();
            if (data.success) {
              this.searchResults = data.vehicles;
              this.currentView = "results";
              this.render();
            }
          } catch (error) {
            console.error("Search failed:", error);
            alert("Failed to search vehicles. Please try again.");
          }
        }
        async trackQuote(pickupDate, dropoffDate, people) {
          try {
            await fetch(`${this.config.apiUrl}/quotes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                client_id: this.config.clientId,
                pickup_location: "Not specified",
                dropoff_location: "Not specified",
                pickup_date: pickupDate,
                dropoff_date: dropoffDate,
                number_of_people: parseInt(people)
              })
            });
          } catch (error) {
            console.error("Failed to track quote:", error);
          }
        }
        renderResults() {
          const resultsContainer = document.createElement("div");
          resultsContainer.innerHTML = `
      <h2>Available Vehicles (${this.searchResults.length})</h2>
      <button id="back-to-search" class="primary" style="margin-bottom: 20px;">New Search</button>
      <div id="vehicles-list"></div>
    `;
          this.container.appendChild(resultsContainer);
          const backBtn = resultsContainer.querySelector("#back-to-search");
          backBtn?.addEventListener("click", () => {
            this.currentView = "search";
            this.render();
          });
          const vehiclesList = resultsContainer.querySelector("#vehicles-list");
          this.searchResults.forEach((vehicle) => {
            const card = this.createVehicleCard(vehicle);
            vehiclesList?.appendChild(card);
          });
        }
        createVehicleCard(vehicle) {
          const card = document.createElement("div");
          card.className = "vehicle-card";
          card.innerHTML = `
      <div class="vehicle-info">
        <h3>${vehicle.name}</h3>
        <p style="color: #6b7280; margin: 4px 0;">${vehicle.operator_name}</p>
        <div class="vehicle-features">
          <span class="feature-badge">${vehicle.transmission}</span>
          <span class="feature-badge">Sleeps ${vehicle.sleeps}</span>
          ${vehicle.has_toilet ? '<span class="feature-badge">Toilet</span>' : ""}
          ${vehicle.has_shower ? '<span class="feature-badge">Shower</span>' : ""}
          <span class="feature-badge">${vehicle.type}</span>
        </div>
        <p style="margin-top: 12px; color: #6b7280;">
          $${vehicle.price_per_day}/day \xD7 ${vehicle.days} days
        </p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
        <div class="vehicle-price">$${vehicle.total_price}</div>
        <button class="primary book-btn" data-vehicle-id="${vehicle.id}">Book Now</button>
      </div>
    `;
          const bookBtn = card.querySelector(".book-btn");
          bookBtn?.addEventListener("click", () => {
            this.selectedVehicle = vehicle;
            this.currentView = "booking";
            this.render();
          });
          return card;
        }
        renderBookingForm() {
          if (!this.selectedVehicle) return;
          const form = document.createElement("div");
          form.innerHTML = `
      <h2>Complete Your Booking</h2>
      
      <div class="booking-summary">
        <h3>${this.selectedVehicle.name}</h3>
        <p style="color: #6b7280;">${this.selectedVehicle.operator_name}</p>
        <div class="summary-row">
          <span>Pick Up Date:</span>
          <strong>${this.searchParams.pickup_date}</strong>
        </div>
        <div class="summary-row">
          <span>Drop Off Date:</span>
          <strong>${this.searchParams.dropoff_date}</strong>
        </div>
        <div class="summary-row">
          <span>Number of People:</span>
          <strong>${this.searchParams.number_of_people}</strong>
        </div>
        <div class="summary-row">
          <span>Daily Rate:</span>
          <strong>$${this.selectedVehicle.price_per_day}</strong>
        </div>
        <div class="summary-row">
          <span>Number of Days:</span>
          <strong>${this.selectedVehicle.days}</strong>
        </div>
        <div class="summary-row total-price">
          <span>Total Price:</span>
          <strong>$${this.selectedVehicle.total_price}</strong>
        </div>
      </div>

      <form id="booking-form">
        <div class="form-group">
          <label for="guest-name">Full Name *</label>
          <input type="text" id="guest-name" required />
        </div>
        <div class="form-group">
          <label for="guest-email">Email Address *</label>
          <input type="email" id="guest-email" required />
        </div>
        <div class="form-group">
          <label for="guest-phone">Phone Number</label>
          <input type="tel" id="guest-phone" />
        </div>
        <div style="margin-top: 20px;">
          <button type="button" id="back-to-results" class="secondary">Back to Results</button>
          <button type="submit" class="primary">Confirm Booking</button>
        </div>
      </form>
      <div id="booking-result" style="margin-top: 20px;"></div>
    `;
          this.container.appendChild(form);
          const backBtn = form.querySelector("#back-to-results");
          backBtn?.addEventListener("click", () => {
            this.currentView = "results";
            this.render();
          });
          const bookingForm = form.querySelector("#booking-form");
          bookingForm.addEventListener("submit", (e) => this.handleBooking(e));
        }
        async handleBooking(e) {
          e.preventDefault();
          if (!this.selectedVehicle) return;
          const guestName = document.getElementById("guest-name").value;
          const guestEmail = document.getElementById("guest-email").value;
          const guestPhone = document.getElementById("guest-phone").value;
          const depotsResponse = await fetch(`${this.config.apiUrl}/depots`);
          const depotsData = await depotsResponse.json();
          const firstDepot = depotsData.depots[0];
          const bookingData = {
            client_id: this.config.clientId,
            vehicle_id: this.selectedVehicle.id,
            pickup_depot_id: firstDepot.id,
            dropoff_depot_id: firstDepot.id,
            pickup_date: this.searchParams.pickup_date,
            dropoff_date: this.searchParams.dropoff_date,
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            number_of_people: parseInt(this.searchParams.number_of_people)
          };
          try {
            const response = await fetch(`${this.config.apiUrl}/bookings`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(bookingData)
            });
            const data = await response.json();
            if (data.success) {
              const resultDiv = document.getElementById("booking-result");
              if (resultDiv) {
                resultDiv.innerHTML = `
            <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px;">
              <h3 style="color: #065f46; margin-top: 0;">Booking Confirmed! \u2713</h3>
              <p>Your booking has been confirmed. Booking ID: <strong>${data.booking.id}</strong></p>
              <p>A confirmation email will be sent to <strong>${guestEmail}</strong></p>
              <button class="primary" style="margin-top: 10px;" onclick="location.reload()">Make Another Booking</button>
            </div>
          `;
                const form = document.getElementById("booking-form");
                if (form) form.style.display = "none";
              }
            }
          } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to create booking. Please try again.");
          }
        }
      };
    }
  });

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    BookingWidget: () => BookingWidget
  });
  init_BookingWidget();
  if (typeof window !== "undefined") {
    window.BookingWidget = (init_BookingWidget(), __toCommonJS(BookingWidget_exports)).BookingWidget;
  }
  return __toCommonJS(index_exports);
})();
