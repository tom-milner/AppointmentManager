<template>
    <div class="wrapper">
        <div v-on-clickaway="closePopup" :style="positionPopup" id="popup">
            <slot id="slot"></slot>
        </div>
    </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
    data() {
        return {
            popupWidth: 0, // The width of the popup
            popupHeight: 0, // The height of the popup
            popupEl: {}, // The popup HTML element.
            popupObserver: {} // The observer used to dynamically update the popup styling.
        };
    },
    methods: {
        // Tell the parent to close the popup.
        closePopup() {
            this.$emit("close-popup");
        },

        // Get the dimensions of the popup.
        getPopupDimensions() {
            // adjust dimensions to fit content
            this.popupEl = document.querySelector("#popup");
            const popupRect = this.popupEl.getBoundingClientRect();
            this.popupWidth = popupRect.width;
            this.popupHeight = popupRect.height;
        }
    },
    mounted() {
        this.getPopupDimensions();

        // create observer to reposition popup when slot contents changes.
        this.popupObserver = new MutationObserver(this.getPopupDimensions);

        // Setup the observer
        this.popupObserver.observe(this.popup, {
            attributes: true, // Watch the popup attributes.
            childList: true, // Watch for addition/removal of child nodes.
            characterData: true, // Watch for character changes within nodes.
            subtree: true // Watch every child of the popup aswell.
        });
    },

    // Before this component is destroyed, disconnect the MutationObserver so that it isn't trying to watch a component that doesn't exist.
    beforeDestroy() {
        this.popupObserver.disconnect();
    },

    props: {
        spaceClicked: {} // The space on the calendar clicked by the user.
    },

    mixins: [clickaway],
    computed: {
        positionPopup() {
            // This function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
            // It also positions the dialogue somewhere not off the screenzs

            // Get window dimensions
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;

            // Offset x and y to make the popup look more natural
            const offsetY = 10;
            const offsetX = 10;

            // The final styling of the object.
            let finalStyle = {};

            // Check to see if the day on the calendar is on the left or right side of the screen
            if (this.spaceClicked.left <= windowWidth / 2) {
                // On the left - move the dialogue box to the right (where there is more space)
                finalStyle.left = `${this.spaceClicked.left + this.spaceClicked.width + offsetX}px`;
            } else {
                // On the right - move dialogue box to the left
                finalStyle.right = `${windowWidth - this.spaceClicked.left + offsetX}px`;
            }

            // Check to see if the dialoge will fit on the screen
            if (this.spaceClicked.top >= windowHeight - this.popupHeight - offsetY) {
                // Dialogue won't fit - set it's positioning using the "bottom" property so that it remains on the screen.
                finalStyle.bottom = `${offsetY}px`;
            } else {
                // Dialogue fits
                finalStyle.top = `${this.spaceClicked.top + offsetY}px`;
            }

            return finalStyle;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global.scss";

// wrapper so other actions can't be triggered when user click outside the box.
.wrapper {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
}

#popup {
    z-index: 100;
    box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
    background-color: $color-white;
    border-radius: 10px;
    padding: 2rem;
    position: fixed;
    width: 40rem;
}
</style>
