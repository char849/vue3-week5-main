// 13. VeeValidate 相關: defineRule、configure 用來當作做設定，以解構的方式宣告
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
// 13. 針對 Rules 的需求引入
const { required, email, min, max } = VeeValidateRules;
// 13. 引入多國語系使用的函式
const { localize, loadLocaleFromURL } = VeeValidateI18n;

// 13. VeeValidate 提供的函式，自定義名稱, 參數( HTML 的 rules="required"  )
defineRule('required', required);
defineRule('email', email);
defineRule('min', min); // 8-10
defineRule('max', max);

// 13. VeeValidate 引入中文的驗證資訊
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

// 13. 透過 configure 的函式來設定
configure({
  generateMessage: localize('zh_TW'),
});


const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'charlotte-hexschool';


const app = Vue.createApp ({
  data() {
    return {
      cartData: {
        carts: []  // 14. 加入第二層 carts: [] html的清空購物車那邊就可以寫入它的結構了
      },
      isLoading: false,
      // 13. 表單驗證格式
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      products: [],  
      productId: '', // 3. 存放傳送外層產品 id
      isLoadingItem: '' // 6. 局部讀取效果的變數
    };  
  },
  // 13. 區域註冊 VeeValidate
  components: {
    // 13. VFrom 自定義的元件名稱 , Form 內容是來自於 VeeValidate，要先宣告
    VForm: Form, 
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    isPhone(value) {
      // cell: (^09|\+?8869)\d{2}(-?\d{3}-?\d{3})$
      // phone: (((\+?(886)\d{1,2})|(^0\d{1,2}))-?)(\d{3,4}-?)(\d{4}-?)$
      const phoneNum = /(^09|\+?8869)\d{2}(-?\d{3}-?\d{3})$/;
      return phoneNum.test(value) ? true : '請輸入正確的手機號碼';
    },
    getProducts() {     
      this.isLoading = true;      
      axios.get(`${apiUrl}/api/${apiPath}/products`)
        .then(res => {      
          this.isLoading = false;    
          //console.log(res);
          //把產品列表存起來，準備呈現在畫面
          this.products = res.data.products;          
        });
    },
    // 2. 運用 $refs 直接操作內層的 openModal
    openProductModal(id) { // 3. 傳入"內層"參數為產品的 id       
      this.productId = id;
      // 2. 運用 $refs 取得 html 中 ref="productModal" 的元件
      // 來操控 內層 openModal() 的方法      
      this.$refs.productModal.openModal();
    },
    // 5. 取得購物車內容
    getCart() {         
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
        .then(res => {
          //console.log(res);          
          this.cartData = res.data.data;          
        });
    },
    // 5. 加入購物車內容，帶入二個參數 id、數量，再加入參數預設值 qty = 1
    addCart(id, qty = 1) { 
      // 5. 加入購物車的資料格式 
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id; // 6. 帶入讀取的id
      axios.post(`${apiUrl}/api/${apiPath}/cart`, {data}) // 5. 將資料格式帶入
        .then(res => {
          //console.log(res);   
          // 5. 加入購物車後，再重新取得購物車內容
          this.getCart();    
          // 12. 從內層 modal 新增數量後關閉
          this.$refs.productModal.clostModal();   
          // 6. 讀取完後，清空id
          this.isLoadingItem = '';          
        });

    },
    // 8. 刪除品項
    removeCartItem(id) {

      this.isLoadingItem = id;      
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`) // 5. 將資料格式帶入
        .then(res => {
          //console.log(res);   
          // 8. 刪除購物車後，再重新取得購物車內容
          this.getCart();       
          // 8. 讀取完後，清空id
          this.isLoadingItem = '';          
        });
    },
    updateCartItem(item) { 
      //10. 更新購物車的資料格式 
      const data = {
        product_id: item.product_id,
        qty: item.qty
      }
      this.isLoadingItem = item.id; // 10. 帶入讀取的id
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, {data}) // 10. 將資料格式帶入
        .then((res) => {
          //console.log(res);   
          // 10. 更新購物車後，再重新取得購物車內容
          this.getCart();       
          // 10. 讀取完後，清空id
          this.isLoadingItem = '';          
        });

    },
    // 14. 刪除購物車內容
    delAllCarts() {    
      this.isLoading = true;                
      axios.delete(`${apiUrl}/api/${apiPath}/carts`)
        .then((res) => {
          this.isLoading = false;
          this.getCart();
        });     
    },
    // 15. 送出訂單
    createOrder() {
      const order = this.form;                  
      axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order })
        .then((res) => {
          //console.log(res.data.message)
          alert(res.data.message)
          // 15. 當表單送出時，清空資料，resetForm()是 VeeValidate 提供的函式
          this.$refs.form.resetForm(); 
          this.getCart();
        });          
    }
  },
  //初使化
  mounted() {
    //把getProducts產品列表
    this.getProducts();
    this.getCart();
  },
});

// 1. 全域註冊 $refs product-modal 元件
app.component('product-modal', {
  // 3. 內層使用 props 來做接收
  props: ['id'],
  template: '#userProductModal',
  // 初始化 
  mounted() {    
    // 1. ref="modal"
    this.modal = new bootstrap.Modal(this.$refs.modal);        
  },
  data() {
    return {
      modal: {}, // 2. 定義一個 modal 的資料變數
      product: {}, // 4. 存入單一筆遠端資料
      qty: 1, // 11. modal中加入購物車的數量      
    };
  },  
  // 4. 利用 watch 監控 props: ['id']，當 id 觸發時 getProduct() 取得遠端資料
  // 每次打開 modal 就要搓伺服器一次，偏向用戶行為
  watch: {
    id() {
      //console.log(this.id);
      this.product = {};
      this.getProduct();
    },
  },
  // 2. 新增 methods 將 openModal 包出去
  methods: {
    openModal() {
      this.modal.show();
    },
    // 12. 內層元件也要新增 closeModal()
    clostModal() {
      this.modal.hide(); 
    },

    // 4. 在元件內取得遠端資料
    getProduct() {   
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          //console.log(res);      
          this.product = res.data.product;          
      }); 
    },
    // 12. 內層傳外層
    addCart() {
      this.$emit('add-cart', this.product.id, this.qty);
    },
  },
  
});
app.component('Loading', VueLoading.Component);
app.mount('#app');