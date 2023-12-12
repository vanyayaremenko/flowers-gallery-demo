const defaultOptions = {
    linkClass: '.card',
};

const modalClassName = 'modal';
const openedClassName = 'modal_Opened';
const openingClassName = 'modal_Opening';

const summaryClassName = 'modalSummary';
const controlsClassName = 'modalControls';
const imagesClassName = 'modalImages';

const summaryContentClassName = 'modalSummaryContent';
const titleClassName = 'modalTitle';
const descriptionClassName = 'modalDescription';
const imageClassName = 'modalImage';

const closeClassName = 'modalClose';
const navsClassName = 'modalNavs';

const navClassName = 'modalNav'; 
const navPrevClassName = 'modalNavPrev';
const navNextClassName = 'modalNavNext';
const couterClassName = 'modalCounter';
const navDisabledClassName = 'modalDisabled';

class Gallery {
    constructor(elementNode, options) {
        this.options = {
            ...defaultOptions,
            ...options
        };
        this.containerNode = elementNode;
        this.linkNodes = elementNode.querySelectorAll(this.options.linkClass);

        this.minWidth = 1023;
        this.minHeight = 600;
        this.padding = 2 * 16;
        this.showingCount = 4;
        this.currentIndex = 0;

        this.size = this.linkNodes.length;

        this.initModal();
        this.events();
    }

    initModal() {
            this.modalContainerNode = document.createElement("div");
            this.modalContainerNode.className = modalClassName;

            this.modalContainerNode.innerHTML = `
            <div class="${summaryClassName}">
                <div class="${summaryContentClassName}">
                    <h2 class="${titleClassName}"></h2>
                    <p class="${descriptionClassName}"></p>
                </div>
            </div>
            <div class="${controlsClassName}">
                <button class="${closeClassName}"></button>
                <div class="${navsClassName}">
                    <button class="${navClassName} ${navPrevClassName}"></button>
                    <div class="${couterClassName}">1/${this.size}</div>
                    <button class="${navClassName} ${navNextClassName}"></button>
                </div>
            </div>
            <div class="${imagesClassName}">
                ${Array.from(this.linkNodes).map((linkNode) => `
                <img src="${linkNode.getAttribute('href')}"
                    alt="${linkNode.dataset.title}"
                    class="${imageClassName}"
                    data-title="${linkNode.dataset.title}"
                    data-description="${linkNode.dataset.description}" \>
                `).join('')}
            </div>
        `;

        document.body.appendChild(this.modalContainerNode);

        this.closeNode = this.modalContainerNode.querySelector(`.${closeClassName}`);

        this.imageNodes = this.modalContainerNode.querySelectorAll(`.${imageClassName}`);
        this.controlsNode = this.modalContainerNode.querySelector(`.${controlsClassName}`);
        this.navPrevNode = this.modalContainerNode.querySelector(`.${navPrevClassName}`);
        this.navNextNode = this.modalContainerNode.querySelector(`.${navNextClassName}`);
        this.counerNode = this.modalContainerNode.querySelector(`.${couterClassName}`);

        this.titleNode = this.modalContainerNode.querySelector(`.${titleClassName}`);
        this.descriptionNode = this.modalContainerNode.querySelector(`.${descriptionClassName}`);
        this.summaryNode = this.modalContainerNode.querySelector(`.${summaryClassName}`);

        this.navsNode = this.modalContainerNode.querySelector(`.${navsClassName}`);
        this.summaryContentNode = this.modalContainerNode.querySelector(`.${summaryContentClassName}`);
    }

    events() {
        this.throttledResize = throttle(this.resize, 200);
        window.addEventListener('resize', this.throttledResize);

        this.containerNode.addEventListener('click', this.activateGallery);
        this.navsNode.addEventListener('click', this.switchImage);
        this.closeNode.addEventListener('click', this.closeGallery);

        window.addEventListener('keyup', this.keyDown);
    }

    keyDown = (event) => {
        if (event.key == 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
            this.closeGallery();
        }
    }

    resize = () => {
        if (this.modalContainerNode.classList.contains(openedClassName)) {
            this.setInitSizesToImages();
            this.setGalleryStyles();
        }
    }

    closeGallery = () => {
        this.setInitPositionsToImages();
        this.imageNodes.forEach((imageNode) => {
            imageNode.style.opacity = 1;
        });

        this.summaryNode.style.width = '0';
        this.controlsNode.style.marginTop = '3000px';

        fadeOut(this.modalContainerNode, () => {
            this.modalContainerNode.classList.remove(openedClassName);
        });
    }

    switchImage = (event) => {
        event.preventDefault();

        const buttonNode = event.target.closest('button');
        if (!buttonNode) {
            return;
        }

        if (buttonNode.classList.contains(navPrevClassName) && this.currentIndex > 0) {
            this.currentIndex -= 1;
        }

        if (buttonNode.classList.contains(navNextClassName) && this.currentIndex < this.size - 1) {
            this.currentIndex += 1;
        }

        this.switchChanges(true);
    }

    activateGallery = (event) => {
        event.preventDefault();
        const linkNode = event.target.closest('a');

        if (!linkNode || this.modalContainerNode.classList.contains(openedClassName)
            || this.modalContainerNode.classList.contains(openingClassName)) {
            return;
        }

        this.currentIndex = Array.from(this.linkNodes).findIndex((itemNode) => (linkNode === itemNode));
        this.modalContainerNode.classList.add(openingClassName);

        fadeIn(this.modalContainerNode, () => {
            this.modalContainerNode.classList.remove(openingClassName);
            this.modalContainerNode.classList.add(openedClassName);
            this.switchChanges();
        });

        this.setInitSizesToImages();
        this.setInitPositionsToImages();
    }

    setInitSizesToImages() {
        this.linkNodes.forEach((linkNode, index) => {
            const data = linkNode.getBoundingClientRect();
            this.imageNodes[index].style.width = data.width + 'px';
            this.imageNodes[index].style.height = data.height + 'px';
        });
    }

    setInitPositionsToImages() {
        this.linkNodes.forEach((linkNode, index) => {
            const data = linkNode.getBoundingClientRect();
            this.setPositionStyles(
                this.imageNodes[index],
                data.left,
                data.top,    
            )
        });
    }

    setPositionStyles(element, x, y) {
        element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }

    switchChanges(hasSummaryAnimation) {
        this.setCurrentState();
        this.switchDisabledNav();
        this.changeCounter();
        this.changeSummary(hasSummaryAnimation);
    }

    changeSummary(hasAnimation){
        const content = this.imageNodes[this.currentIndex].dataset;

        if (hasAnimation) {
            this.summaryContentNode.style.opacity = 0;
            setTimeout(() => {
                this.titleNode.innerText = content.title;
                this.descriptionNode.innerText = content.description;

                this.summaryContentNode.style.opacity = 1;
            }, 300);
        } else {
            this.titleNode.innerText = content.title;
            this.descriptionNode.innerText = content.description;
        }
    }

    switchDisabledNav() {
        if (this.currentIndex === 0 && !this.navPrevNode.disabled) {
            this.navPrevNode.disabled = true;
        }

        if (this.currentIndex > 0 && this.navPrevNode.disabled) {
            this.navPrevNode.disabled = false;
        }

        if (this.currentIndex === this.size - 1 && !this.navPrevNode.disabled) {
            this.navNextNode.disabled = true;
        }

        if (this.currentIndex < this.size - 1 && this.navNextNode.disabled) {
            this.navNextNode.disabled = false;
        }
    }

    changeCounter() {
        this.counerNode.innerText = `${this.currentIndex + 1}/${this.size}`;
    }

    setCurrentState() {
        this.prevHiddenImageNodes = [];
        this.prevShowingImageNodes = [];
        this.activeImageNodes = [];
        this.nextShowingImageNodes = [];
        this.nextHiddenImageNodes = [];
    
        this.imageNodes.forEach((imageNode, index) => {
            if (index + this.showingCount < this.currentIndex) {
                this.prevHiddenImageNodes.unshift(imageNode);
            } else if (index < this.currentIndex) {
                this.prevShowingImageNodes.unshift(imageNode);
            } else if (index === this.currentIndex) {
                this.activeImageNodes.push(imageNode);
            } else if (index <= this.currentIndex + this.showingCount) {
                this.nextShowingImageNodes.push(imageNode);
            } else {
                this.nextHiddenImageNodes.push(imageNode);
            }
        });
    
        this.setGalleryStyles();
    }

    setGalleryStyles() {
        const imageWidth = this.linkNodes[0].offsetWidth;
        const imageHeight = this.linkNodes[0].offsetHeight;
        const modalWidth = Math.max(this.minWidth, window.innerWidth);
        const modalHeight = Math.max(this.minHeight, window.innerHeight);

        this.prevHiddenImageNodes.forEach((node) => {
            this.setImageStyles(node, {
                //   top: -1.5 * modalHeight,
              top: -modalHeight,
              left: 0.29 * modalWidth,
              opacity: 0.1,
              zIndex: 1,
              scale: 0.4,
            });
        });
      
        this.setImageStyles(this.prevShowingImageNodes[0], {
            top: (modalHeight - imageHeight),
            left: 0.25 * modalWidth,
            opacity: 0.4,
            zIndex: 4,
            scale: 0.75,
        });
      
        this.setImageStyles(this.prevShowingImageNodes[1], {
            top: 0.35 * modalHeight,
            left: 0.06 * modalWidth,
            opacity: 0.3,
            zIndex: 3,
            scale: 0.6,
        });
    
        this.setImageStyles(this.prevShowingImageNodes[2], {
            // top: 0.095 * modalHeight,
            top: 0,
            left: 0.15 * modalWidth,
            opacity: 0.2,
            zIndex: 2,
            scale: 0.5,
        });

        this.setImageStyles(this.prevShowingImageNodes[3], {
            top: -0.3 * imageHeight,
            left: 0.29 * modalWidth,
            opacity: 0.1,
            zIndex: 1,
            scale: 0.4,
        });

        
        this.activeImageNodes.forEach((node) => {
            this.setImageStyles(node, {
              top: (modalHeight - imageHeight) / 2,
            //   left: (modalWidth / 2 - imageWidth * 1/3),
              left: (modalWidth - imageWidth) / 2,
              opacity: 1,
              zIndex: 5,
              scale: 1.2,
            });
        });

        this.setImageStyles(this.nextShowingImageNodes[0], {
            top: 0,
            left: 0.52 * modalWidth,
            opacity: 0.4,
            zIndex: 4,
            scale: 0.75,
        });

        this.setImageStyles(this.nextShowingImageNodes[1], {
            top: 0.12 * modalHeight,
            left: 0.73 * modalWidth,
            opacity: 0.3,
            zIndex: 3,
            scale: 0.6,
        });

        this.setImageStyles(this.nextShowingImageNodes[2], {
            top: 0.46 * modalHeight,
            left: 0.67 * modalWidth,
            opacity: 0.2,
            zIndex: 2,
            scale: 0.5,
        });

        this.setImageStyles(this.nextShowingImageNodes[3], {
            top: 0.67 * modalHeight,
            left: 0.53 * modalWidth,
            opacity: 0.1,
            zIndex: 1,
            scale: 0.4,
        });


        this.nextHiddenImageNodes.forEach((node) => {
            this.setImageStyles(node, {
            //   top: 1.5 * modalHeight,
            top: modalHeight,
              left: 0.53 * modalWidth,
              opacity: 0.1,
              zIndex: 1,
              scale: 0.4,
            });
        });

        this.setControlsStyles(this.controlsNode, {
            marginTop : (modalHeight - imageHeight * 1.2) / 2,
            height: imageHeight * 1.2
        });

        this.summaryNode.style.width = '45%';
    }

    setImageStyles(element, {top, left, opacity, zIndex, scale}) {
        if (!element) {
          return;
        }

        element.style.opacity = opacity;
        element.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) scale(${scale})`;
        element.style.zIndex = zIndex;
    }

    setControlsStyles(element, {marginTop, height}) {
        element.style.marginTop = marginTop + 'px';
        element.style.height = height + 'px';
    }
}

function fadeIn(element, callback) {
    animation();

    function animation() {
        let opacity = Number(element.style.opacity);
        if (opacity < 1) {
            opacity = opacity + 0.08
            element.style.opacity = opacity;
            window.requestAnimationFrame(animation);
            return;
        }

        if (callback) {
            callback();
        }
    }
}

function fadeOut(element, callback) {
    animation();

    function animation() {
        let opacity = Number(element.style.opacity);
    
        if (opacity > 0) {
            opacity = opacity - 0.03
            element.style.opacity = opacity;
            window.requestAnimationFrame(animation);
            return;
        }

        if (callback) {
            callback();
        }
    }
}

function throttle(callback, delay = 250) {
    let isWaiting = false;
    let savedArgs = null;
    let savedThis = null;
    return function wrapper(...args) {
        if (isWaiting) {
            savedArgs = args;
            savedThis = this;
            return;
        }

        callback.apply(this, args);

        isWaiting = true;
        setTimeout(() => {
            isWaiting = false;
            if (savedThis) {
                wrapper.apply(savedThis, savedArgs);
                savedThis = null;
                savedArgs = null;
            }
        }, delay);
    }
}


