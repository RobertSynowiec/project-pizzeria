/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  class Product{ // deklaracja klasy
    constructor(id, data){
      const thisProduct = this; //  this jest odnośnikiem do obiektu, który jest utworzony przez klasę podczas inicjacji, a więc w momencie uruchomienia instrukcji new Product.  Zapisując właściwości do thisProduct, przypiszemy je więc po prostu do danej instancji.

      thisProduct.id = id;
      thisProduct.data = data;
      //console.log('this product data ', thisProduct.data);

      thisProduct.renderInMenu(); // Zadba o to, by nasz konstruktor uruchomił tę funkcję od razu po utworzeniu instancji.
      //console.log('new Product: ', thisProduct);
      thisProduct.getElements(); // wywołania metod
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

      renderInMenu(){
        const thisProduct = this; // metoda która bedzie renderować ( tworzyc thisProduct.data na stronie)

        /* generate HTML based on temaplte */
        const generatedHTML = templates.menuProduct(thisProduct.data);
        //console.log('generatedHTML : ', generatedHTML);

        /* create element using utilies.createElementFromHTML*/
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        /* find menu container */
        const menuConatiner = document.querySelector(select.containerOf.menu);


        /* add element to menu */
        menuConatiner.appendChild(thisProduct.element);

      }
      getElements(){
        const thisProduct = this;

        thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // used in initAccordion
        thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
        //console.log('thisProduct.form, ',thisProduct.form);

        thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
        //console.log('thisProduct.formInputs ', thisProduct.formInputs);
        thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // used images
        thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
        console.log('thisProduct.amountWidgetElem ', thisProduct.amountWidgetElem);

      }
      initAccordion(){

        const thisProduct = this;
        //console.log('thisProduct ' , thisProduct );



        /* START: add event listener to clickable trigger on event click */
        thisProduct.accordionTrigger.addEventListener('click', function(event) {

          /* prevent default action for event */
            event.preventDefault();

          /* find active product (product that has active class) */

          const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

          //console.log('activeProducts' , activeProducts);

          /* if there is active product and it's not thisProduct.element,
          remove class active from it */


          for(let activeProduct of activeProducts){

            if (activeProduct !== thisProduct.element) {
                activeProduct.classList.remove('active');

            }
          }

          /* toggle active class on thisProduct.element */
          thisProduct.element.classList.toggle('active')

            });
      }
      initOrderForm(){

        const thisProduct = this;

        thisProduct.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });

        for(let input of thisProduct.formInputs){
          input.addEventListener('change', function(){
            thisProduct.processOrder();
          });
        }

        thisProduct.cartButton.addEventListener('click', function(event){
          event.preventDefault();
          thisProduct.processOrder();
          thisProduct.addToCart();
        });

      }
      processOrder(){

        const thisProduct = this;
        //console.log('this product: ', thisProduct);

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.form);


        // set price to default price
        let price = thisProduct.data.price;

        // START start


        // for every category (param)...
        for(let paramId in thisProduct.data.params) {

          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];
          //console.log('param :', param);

          // for every option in this category
          for(let optionId in param.options) {

            // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
            const option = param.options[optionId];
            //console.log('option: ', option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            //console.log('optionSelected ', optionSelected);
          if(optionSelected) {

            // check if the option is not default
            if(option.default == true) {

              // add option price to price variable

              price = price + option.price;

            }
          }else if(option.default !==  true) {
              // reduce price variable
              price = price - option.price;

          }
          // END price


          // START images
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); // '.' because we are looking after class
          //console.log(optionImage);


            // check if the option exists
            if(optionImage){

              if(optionSelected){

              // if the option exists add class active
              optionImage.classList.add(classNames.menuProduct.imageVisible);


          } else{

            // remove class active
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

        // END images
      }
    }
        // multiply price by amount
        price *= thisProduct.amountWidget.value;
        // update calculated price in the HTML
        thisProduct.priceSingiel = price;
        thisProduct.priceElem.innerHTML = price;


      }
      initAmountWidget(){
        const thisProduct = this;

        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); // pass references to element in constructor(element)
        thisProduct.amountWidgetElem.addEventListener('updated', function(){
          thisProduct.processOrder();

        });

      }
      addToCart(){
        const thisProduct = this;
        app.cart.add(thisProduct.prepareCartProduct());


/// koniec


      }
      prepareCartProduct(){
        const thisProduct = this;

        const productSummary = {

          id: thisProduct.id,
          name: thisProduct.name,
          amount: thisProduct.amount,
          priceSingle: thisProduct.priceSingle,
          price: (thisProduct.priceSingle * thisProduct.amount),
          params: {},

        };

        return productSummary;

      }

  }
  class AmountWidget{

      constructor(element){
        const thisWidget = this;

        console.log('AmountWidget ', thisWidget);
        console.log('constructor arguments ', element);

        thisWidget.getElements(element);
        thisWidget.setValue(settings.amountWidget.defaultValue);
        thisWidget.initActions();

      }
      getElements(element){
        const thisWidget = this;

        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);


      }
      setValue(value){
        const thisWidget = this;

        const newValue = parseInt(value); // parseInt zadba o konwersję takiej przykładowej '10' ( string) do liczby 10 ( Int)
        console.log('newvalue', newValue);

        /* TODO: Add validation */

        if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin - 1 &&
        newValue <= settings.amountWidget.defaultMax + 1) {

          thisWidget.value = newValue;
          thisWidget.announce();
        }

        thisWidget.input.value = thisWidget.value;

      }

      initActions(){

        const thisWidget = this;

        thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        });

        thisWidget.linkDecrease.addEventListener('click', function(event){
          event.preventDefault();
          thisWidget.setValue(thisWidget.value - 1);
        });

        thisWidget.linkIncrease.addEventListener('click', function(event){
          event.preventDefault();
          thisWidget.setValue(thisWidget.value + 1);
        });

      }
      announce(){

        const thisWidget = this;

        const event = new Event('updated');
        thisWidget.element.dispatchEvent(event);

      }


  }
  class Cart{
    constructor(element){

      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    console.log(thisCart.dom.toggleTrigger);
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click' ,function(event){
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle('active');

    });
  }
  add(menuProduct){
    // const thisCart = this;

    console.log('adding product ', menuProduct);

  }
}
  const app = {

    initMenu: function(){ //method initMenu

      const thisApp = this;
      console.log('thisApp.data :', thisApp.data);

      for(let productData in thisApp.data.products){

        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){ //access to data from dataSource
      const thisApp = this;

    thisApp.data = dataSource; // przypisanie ( adresu )referencji (ponieważ jest to obiekt złożony) dataSource pod właściwość data
    },

    init: function(){ //method init
      const thisApp = this;
      //console.log('*** App starting ***');
     // console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData(); //ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję do dataSource
      thisApp.initMenu(); //przejdzie po każdym produkcie z osobna i stworzy dla niego instancję Product, czego wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.
      thisApp.initCart();
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem)
      console.log('thisApp ', thisApp.cart);

    }


  };

  app.init();

}

