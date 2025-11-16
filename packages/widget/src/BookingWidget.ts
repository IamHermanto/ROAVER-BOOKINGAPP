import { VehicleSearchResult, ClientConfig } from '@shared/types';

interface WidgetConfig {
  apiUrl: string;
  clientId: string;
}

export class BookingWidget {
  private container: HTMLElement;
  private config: WidgetConfig;
  private clientConfig: ClientConfig | null = null;
  private searchResults: VehicleSearchResult[] = [];
  private currentView: 'search' | 'results' | 'booking' = 'search';

  constructor(containerId: string, config: WidgetConfig) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.config = config;
  }

  async init() {
    // Load client configuration for theming
    await this.loadClientConfig();
    // Apply theme
    this.applyTheme();
    // Render initial search view
    this.render();
  }

  private async loadClientConfig() {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/clients/${this.config.clientId}/config`
      );
      const data = await response.json();
      if (data.success) {
        this.clientConfig = data.config;
      }
    } catch (error) {
      console.error('Failed to load client config:', error);
    }
  }

  private applyTheme() {
    if (!this.clientConfig) return;

    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);
  }

  private render() {
    this.container.innerHTML = '';
    this.container.className = 'booking-widget';

    switch (this.currentView) {
      case 'search':
        this.renderSearchForm();
        break;
      case 'results':
        this.renderResults();
        break;
      case 'booking':
        this.renderBookingForm();
        break;
    }
  }

  private renderSearchForm() {
    const form = document.createElement('div');
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

    const searchForm = form.querySelector('#search-form') as HTMLFormElement;
    searchForm.addEventListener('submit', (e) => this.handleSearch(e));
  }

  private async handleSearch(e: Event) {
    e.preventDefault();

    const pickupDate = (document.getElementById('pickup-date') as HTMLInputElement).value;
    const dropoffDate = (document.getElementById('dropoff-date') as HTMLInputElement).value;
    const people = (document.getElementById('people') as HTMLInputElement).value;
    const transmission = (document.getElementById('transmission') as HTMLSelectElement).value;
    const vehicleType = (document.getElementById('vehicle-type') as HTMLSelectElement).value;

    // Build query params
    const params = new URLSearchParams({
      pickup_date: pickupDate,
      dropoff_date: dropoffDate,
      number_of_people: people,
    });

    if (transmission) params.append('transmission', transmission);
    if (vehicleType) params.append('vehicle_type', vehicleType);

    try {
      const response = await fetch(`${this.config.apiUrl}/vehicles/search?${params}`);
      const data = await response.json();

      if (data.success) {
        this.searchResults = data.vehicles;
        this.currentView = 'results';
        this.render();
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search vehicles. Please try again.');
    }
  }

  private renderResults() {
    const resultsContainer = document.createElement('div');
    
    resultsContainer.innerHTML = `
      <h2>Available Vehicles (${this.searchResults.length})</h2>
      <button id="back-to-search" class="primary" style="margin-bottom: 20px;">New Search</button>
      <div id="vehicles-list"></div>
    `;

    this.container.appendChild(resultsContainer);

    const backBtn = resultsContainer.querySelector('#back-to-search');
    backBtn?.addEventListener('click', () => {
      this.currentView = 'search';
      this.render();
    });

    const vehiclesList = resultsContainer.querySelector('#vehicles-list');
    
    this.searchResults.forEach(vehicle => {
      const card = this.createVehicleCard(vehicle);
      vehiclesList?.appendChild(card);
    });
  }

  private createVehicleCard(vehicle: VehicleSearchResult): HTMLElement {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    card.innerHTML = `
      <div class="vehicle-info">
        <h3>${vehicle.name}</h3>
        <p style="color: #6b7280; margin: 4px 0;">${vehicle.operator_name}</p>
        <div class="vehicle-features">
          <span class="feature-badge">${vehicle.transmission}</span>
          <span class="feature-badge">Sleeps ${vehicle.sleeps}</span>
          ${vehicle.has_toilet ? '<span class="feature-badge">Toilet</span>' : ''}
          ${vehicle.has_shower ? '<span class="feature-badge">Shower</span>' : ''}
          <span class="feature-badge">${vehicle.type}</span>
        </div>
        <p style="margin-top: 12px; color: #6b7280;">
          $${vehicle.price_per_day}/day × ${vehicle.days} days
        </p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
        <div class="vehicle-price">$${vehicle.total_price}</div>
        <button class="primary book-btn" data-vehicle-id="${vehicle.id}">Book Now</button>
      </div>
    `;

    const bookBtn = card.querySelector('.book-btn');
    bookBtn?.addEventListener('click', () => {
      console.log('Booking vehicle:', vehicle.id);
      // Will implement booking form next
    });

    return card;
  }

  private renderBookingForm() {
    // Will implement in next step
    this.container.innerHTML = '<h2>Booking Form</h2><p>Coming soon...</p>';
  }
}