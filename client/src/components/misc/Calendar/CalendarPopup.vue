<template>
    <div class="wrapper">
        <div v-on-clickaway="closePopup" :style="positionPopup" class="popup">
            <slot id="slot"></slot>
        </div>
    </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";
import Utils from "@/utils";

export default {
    data() {
        return {
            popupWidth: 0,
            popupHeight: 0
        };
    },
    methods: {
        closePopup() {
            this.$emit("close-popup");
        }
    },
    mounted() {
        // adjust dimensions to fit content
        let popup = document.querySelector(".popup").getBoundingClientRect();
        this.popupWidth = Utils.convertPixelsToRem(popup.width);
        this.popupHeight = Utils.convertPixelsToRem(popup.height);
    },
    props: {
        // spaceClicked is an object that should be obtained using getBoundingClientRect()
        spaceClicked: {}
    },

    mixins: [clickaway],
    computed: {
        positionPopup() {
            // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
            // it also positions the dialogue somewhere not off the screenzs
            let elementX, elementY;
            // get window dimensions
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;
            // convert dimensions of the dialogue box into pixels
            let popupHeightPx = Utils.convertRemToPixels(this.popupHeight);
            let popupWidthPx = Utils.convertRemToPixels(this.popupWidth);

            // offset x and y to make dialogue look more natural
            let offsetY = 10;
            let offsetX = 10;

            // the rectangle of screen used by the element
            let clickedElement = this.spaceClicked;

            let finalStyle = {};

            // check to see if the day on the calendar is on the left or right side of the screen
            if (clickedElement.left <= windowWidth / 2) {
                // on the left - move the dialogue box to the right (where there is more space)
                elementX = clickedElement.left + clickedElement.width + offsetX;
            } else {
                // on the right - move dialogue box to the left
                elementX = clickedElement.left - popupWidthPx - offsetX;
            }
            finalStyle.left = `${elementX}px`;

            // check to see if the dialoge will fit on the screen
            if (clickedElement.top >= windowHeight - popupHeightPx) {
                // dialogue won't fit - move it up so that it does
                // elementY = windowHeight - popupHeightPx - offsetY;
                // make extra room underneath popup
                // elementY -= 40;
                finalStyle.bottom = `${offsetY + 40}px`;
            } else {
                // dialogue fits
                elementY = clickedElement.top + offsetY;
                finalStyle.top = `${elementY}px`;
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

.popup {
    z-index: 100;
    box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
    background-color: $color-white;
    border-radius: 10px;
    padding: 2rem;
    position: fixed;
    width: 40rem;
}
</style>
