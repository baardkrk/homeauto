class EnturPublicTransportCard extends HTMLElement {
    set hass(hass) {

        const entityId = this.config.entity;
        const state = hass.states[entityId];
        
        if (!state) {
            return this.innerHTML = `
                <hui-warning>
                    ${this.hass.localize(
                        "ui.panel.lovelace.warning.entity_not_found",
                        "entity",
                        this.config.entity
                    )}
                </hui-warning>
            `;
        }

        if (!this.content) {
            this.innerHTML = `
                <ha-card header="OK">
                    <div class="card-content"></div>
                </ha-card>
            `;
            this.content = this.querySelector('div');
        }

        this.content.innerHTML = `
            <div class="entur-routes">SOMETHING</div>
        `;
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("You need to define an entity");
        }
        this.config = config;
    }

    getCardSize() {
        return 2;
    }
}

customElements.define('entur-public-transport-card', EnturPublicTransportCard);
