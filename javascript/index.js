const { createApp } = Vue;

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true,
});

const app = createApp({
  data() {
    return {
      text: "hello",
      ApiUrl: "https://vue3-course-api.hexschool.io",
      bsModal: null,
      path: "royen",
      productList: [],
      cartList: {},
      productDetails: {},
      loadingId: "",
      customInfo: {
        user: {},
      },
      regex: /^09[0-9]{8}$/,
      isLoading: false,
      fullPage: false,
      modalTxt: "",
      orderBsModal: null,
    };
  },

  mounted() {
    this.getProductList();
    this.getCartList();
  },

  methods: {
    getProductList() {
      axios
        .get(`${this.ApiUrl}/v2/api/${this.path}/products/all`)
        .then((res) => {
          this.productList = res.data.products;
          this.getCartList();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    addToCart(product_id, qty = 1) {
      this.loadingId = product_id;
      let productObj = {
        product_id,
        qty,
      };
      axios
        .post(`${this.ApiUrl}/v2/api/${this.path}/cart`, { data: productObj })
        .then((res) => {
          this.resetLoadingStatus();
          alert(res.data.message);
          this.getCartList();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },

    getCartList() {
      axios
        .get(`${this.ApiUrl}/v2/api/${this.path}/cart`)
        .then((res) => {
          this.cartList = res.data.data;
          this.cartList.total = res.data.data.total;
          this.cartList.final_total = res.data.data.final_total;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },

    updateCartList(id, qty) {
      let obj = {
        product_id: id,
        qty,
      };
      axios
        .put(`${this.ApiUrl}/v2/api/${this.path}/cart/${id}`, {
          data: obj,
        })
        .then((res) => {
          this.getCartList();
          alert(res.data.message);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    deleteCart(id) {
      this.loadingId = id;
      axios
        .delete(`${this.ApiUrl}/v2/api/${this.path}/cart/${id}`)
        .then((res) => {
          this.resetLoadingStatus();
          alert(res.data.message);
          this.getCartList();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    deleteCartAll() {
      axios
        .delete(`${this.ApiUrl}/v2/api/${this.path}/carts`)
        .then((res) => {
          alert(res.data.message);
          this.getCartList();
        })
        .catch((err) => {
          this.isLoading = false;
          alert(err.response.data.message);
        });
    },

    watchDetails(item) {
      this.loadingId = item.id;
      this.productDetails = item;
      this.bsModal.show();
    },

    sendOrder() {
      const order = this.customInfo;
      this.isLoading = true;
      axios
        .post(`${this.ApiUrl}/api/${this.path}/order`, { data: order })
        .then((res) => {
          this.isLoading = false;
          this.modalTxt = res.data.message;
          this.$refs.form.resetForm();
          this.getCartList();
          this.orderBsModal.show();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },

    getBsModal(modal) {
      this.bsModal = modal;
    },

    getOrderModal(orderModal) {
      this.orderBsModal = orderModal;
    },

    resetLoadingStatus() {
      this.loadingId = "";
    },
  },
});

app.component("bs-modal", {
  data() {
    return {
      bsModal: null,
      addQty: 1,
    };
  },

  props: ["productItem"],

  methods: {
    emitCart(id, qty = 1) {
      this.$emit("emitCart", id, qty);
      this.addQty = 1;
    },

    emitLoadingStatus() {
      this.$emit("emitLoadingStatus");
    },
  },

  mounted() {
    this.bsModal = new bootstrap.Modal(this.$refs.modal, {
      keyboard: false,
      backdrop: "static",
    });
    this.$emit("emit-modal", this.bsModal);
  },

  template: "#userProductModal",
});

app.component("send-order-modal", {
  data() {
    return {
      bsOrderModal: null,
    };
  },

  mounted() {
    this.bsOrderModal = new bootstrap.Modal(this.$refs.orderModal);
    this.$emit("emit-order-modal", this.bsOrderModal);
  },

  props: ["orderModalTxt"],

  template: `<div class="modal" tabindex="-1" ref="orderModal">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">系統訊息</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p>{{ orderModalTxt }}</p>
                  </div>
                  <div class="modal-footer">
                    <button data-bs-dismiss="modal" type="button" class="btn btn-primary">確認</button>
                  </div>
                </div>
              </div>
            </div>`,
});

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);
app.component("loading", VueLoading.Component);
app.mount("#app");
