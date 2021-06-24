let orderData = [];
const orderList = document.querySelector(".js-orderList");

// 初始化
function init() {
  getOrderList();
}
init();

// 功能五：聯動圖表比例
function renderC3() {
  // 步驟 5-1：物件資料蒐集
  let total= {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(total[productItem.category] == undefined){
        total[productItem.category] = productItem.price*productItem.quantity;
      }else{
        total[productItem.category] += productItem.price*productItem.quantity;
      }
    })
  });
  
  // 步驟 5-2：做出資料關聯
  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach(function(item){
    let ary= [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  console.log(newData);

  // C3 js
  let chart = c3.generate({
    bindto: "#chart", //HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      color: {
        'Louvre 雙人床架': "#DACBFF",
        'Aotony 雙人床架': "#9D7FEA",
        'Anty 雙人床架': "#543A7",
        '其他': "#301E5F",
      }
    },
  });
};

// 功能一：讀取定單資料
function getOrderList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      //步驟 1-1：讀取遠端資料，並呈列
      orderData = response.data.orders;
      let str = '';
      orderData.forEach(function (item) {
        // 步驟 1-4：組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()};`

        // 步驟 1-3：組產品字串 (若選擇多樣商品也需條列進表格)
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title} x ${productItem.quantity} 件</p>`
        });

        // 步驟 1-4：判斷訂單處理狀態(從顯示 "false" → "未處理")
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理"
        } else {
          orderStatus = "未處理"
        };

        // 步驟 1-2：組訂單字串，用參數簡化顯示
        str += `<tr>
      <td>${item.id}</td>
      <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${productStr}
      </td>
      <td>${orderTime}</td>
      <td class="js-orderStatus">
          <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
      </td>
      <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
      </td>
  </tr>`
      })
      orderList.innerHTML = str;
      renderC3();
    })
};

// 功能二：未處理與刪除訂單
// 步驟 2-1：點擊到「訂單狀態」、「刪除按鈕」
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  console.log(targetClass);
  let id = e.target.getAttribute("data-id");

  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    deleteOrderItem(id)
    return;
  };

  // 步驟 2-3：刪除選項
  if (targetClass == "orderStatus") {
    let status = e.target.getAttribute("data-status");
    changOrderStatus(status, id);
    return;
  };

});

// 步驟 2-2：更改訂單狀態
function changOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  };
  axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    "data": {
      "id": id,
      "paid": newStatus
    }
  }, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("修改訂單成功");
      getOrderList();
    })
};

// 功能三：刪除單筆訂單資料
function deleteOrderItem(id) {
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除此筆資料成功");
      getOrderList();
    })
};

// 功能四：刪除全部訂單資料
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders
  `, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    })
});