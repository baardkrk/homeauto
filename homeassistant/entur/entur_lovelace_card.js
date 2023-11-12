import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";


class EnturPublicTransportCard extends LitElement {
  static get is() {
    return "entur-public-transport-card";
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const state = this.hass.states[this._config.entity];

    if (!state) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }
    this._update_departures(state);
    return html`
      <ha-card id="hacard">
        <div class="card-header">
          ${state.attributes.friendly_name}
          ${this._config.show_last_changed
            ? html`
            <div class="name">
              ${this.last_changed}
            </div>`
            : html``
           }
        </div>
        <div class="routes">
           ${this.departures.map(
             departure => html`
             <div class=etaline">
              <div class="linename">${departure.linename}</div>
              <div class="eta">${departure.eta}</div>
             </div>
             `
           )}
        </div>
      </ha-card>
    `;
  }

  static get properties() {
    return {
      header: { type: String },
      hass: {
        type: Object
      },
      departures: {
        type: Object
      },
      _config: {
        type: Object
      },
      showConfig: Boolean
    };
  }

  _update_departures(state) {
    var departures = [];
    const now = moment();

    this.last_changed = moment.duration(moment(state.last_changed).diff(now)).humanize(true);


    const departure_countdown = 60 * (this._config.departure_countdown === undefined ? 15 : 0);
    
    if (!state.attributes["departures"]) {
      this.departures = [];
      return;
    }

    const due_at = state.attributes["due_at"]
    const delay = state.attributes["delay"]

    const eta = "5 min"
    const next_eta = "ca. 10 min"

    departures.push({
      linename: state.attributes["route"],
      eta: departure_time
    });

    departures.push({
      linename: state.attributes["next_route"],
      eta: next_eta
    });

    this.departures = departures;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this._config = config;
    this.departures = [];
  }

  getCardSize() {
    return 1;
  }

  firstUpdated(changedProperties) {
    if (this._config.show_seconds)
      setInterval(() => this.requestUpdate(), 1000);
    else
      setInterval(() => this.requestUpdate(), 10000);
  }

  static get styles() {
    return css`
      .name {
        line-height: normal;
        font-size: 16px;
        color: var(--secondary-text-color);
      }
      .etaline {
        width: 100%;
          padding: 1em;
      }
      .eta {
        float: right;
      }
      .linename {
        float: left;
      }
    `;
  }
}

customElements.define("entur-public-transport-card", EnturPublicTransportCard);
