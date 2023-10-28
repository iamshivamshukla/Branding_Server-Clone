require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
// const session = require("express-session");

var dbCollation = require("./db");
var indexRouter = require("./routes/index");
var RegisterRouter = require("./routes/Admin_Register");
var MainBannerRouter = require("./routes/MainBanner");
var UserRegisterRouter = require("./routes/User_Register");
var AdvertiseBannerRouter = require("./routes/AdvertiseBanner");
var PopupBannerRouter = require("./routes/PopupBanner");
var TrendingBannerRouter = require("./routes/TrendingAndNewsBanner");
var TodayAndTomorrowCategoryRouter = require("./routes/TodayAndTomorrow_Category");
var Cds_CategoryRouter = require("./routes/CDS_Category");
var CDS_CustomeDynamicSectionRouter = require("./routes/CDS_CustomeDynamicSection");
var CDS_CustomeDynamicBanner = require("./routes/CDS_Banner");
var MyBusiness_AddBusinessTypeRouter = require("./routes/MyBusiness_AddBusinessType");
var MyBusiness_Category = require("./routes/MyBusiness_Category");
var MyBusinessDataRouter = require("./routes/MyBusiness");
var MyBusiness_Banner = require("./routes/MyBusiness_Banner");
var TodayAndTomorrowRouter = require("./routes/TodayAndTomorrow");
var DynamicSection_Title = require("./routes/DynamicSection_Title");
var DynamicSection_Item = require("./routes/DynamicSection_Data");
var TrendingAndNews_Category = require("./routes/TrendingAndNews_Category");
var TrendingAndNews_Data = require("./routes/TrendingAndNews_Data");
var AddLanguage = require("./routes/AddLanguage");
var Frame = require("./routes/Frame");
var PaymentStatus = require("./routes/PaymentStatus");
var WalletHistoryRouter = require("./routes/WalletHistory");
var Notification = require("./routes/BusinessNotification");
var WithdrawalRouter = require("./routes/Withdrawal");
var frameRequestRouter = require("./routes/FrameRequest");
var frameUserSaveRouter = require("./routes/Frame_UserSaved");
var AddDefaultDaysForCategoryRouter = require("./routes/AddDefaultDaysForCategory");
var AddClippingCountRouter = require("./routes/AddClippingCount");
var SplashScreenRouter = require("./routes/SplashScreen");
var MlmRegisterRouter = require("./routes/MlmRegister");
var SavedFrameRouter = require("./routes/SavedFrame");
var FrameRequestResponceUser = require("./routes/FrameResponce_User")
var KycRouter = require("./routes/Kyc")
var PhpApiRouter = require("./routes/PhpApi")
var DefaultBannerRouter = require("./routes/DefaultBanner")

var bodyParser = require("body-parser");
var app = express();

// "engines": {
//   "node": "18.x"
// },
// 0;
// var jsonParser = bodyParser.json({
//   limit: 1024 * 1024 * 10,
//   type: "application/json",
// });
// var urlencodedParser = bodyParser.urlencoded({
//   extended: true,
//   limit: 1024 * 1024 * 10,
//   type: "application/x-www-form-urlencoded",
// });

// app.use(jsonParser);
// app.use(urlencodedParser);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.set("view engine", "ejs");

// Add this line before your routes
// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// Increase payload limit (e.g., 50 MB)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/register", RegisterRouter); //Admin
app.use("/mainbanner", MainBannerRouter);
app.use("/user", UserRegisterRouter); // User
app.use("/advertise_banner", AdvertiseBannerRouter);
app.use("/popup_banner", PopupBannerRouter);
app.use("/trending", TrendingBannerRouter);
app.use("/today", TodayAndTomorrowCategoryRouter);
app.use("/cds_category", Cds_CategoryRouter);
app.use("/cd_section", CDS_CustomeDynamicSectionRouter);
app.use("/cd_banner", CDS_CustomeDynamicBanner);
app.use("/business_type", MyBusiness_AddBusinessTypeRouter);
app.use("/business_category", MyBusiness_Category);
app.use("/my_business", MyBusinessDataRouter);
app.use("/business_banner", MyBusiness_Banner);
app.use("/todayandtomorrow", TodayAndTomorrowRouter);
app.use("/ds_title", DynamicSection_Title);
app.use("/ds_item", DynamicSection_Item);
app.use("/trending_category", TrendingAndNews_Category);
app.use("/trending_section", TrendingAndNews_Data);
app.use("/language", AddLanguage);
app.use("/frame", Frame);
app.use("/payment", PaymentStatus);
app.use("/wallet", WalletHistoryRouter);
app.use("/notification", Notification);
app.use("/withdrawal", WithdrawalRouter);
app.use("/framerequest", frameRequestRouter);
app.use("/saveframe", frameUserSaveRouter);
app.use("/categorydays", AddDefaultDaysForCategoryRouter);
app.use("/clipping", AddClippingCountRouter);
app.use("/splashscreen", SplashScreenRouter);
app.use("/mlm", MlmRegisterRouter);
app.use("/savedframe", SavedFrameRouter);
app.use("/framerespoce", FrameRequestResponceUser);
app.use("/kyc", KycRouter);
app.use("/mlm", PhpApiRouter);
app.use("/default_banner", DefaultBannerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
