import {tenantList} from "./tenantlist.js"
import { version } from './version.js'
/**
 * Returns fully formatted object.
 * @param {object} obj - data layer object.
 * @return {function name(params) { }}} - Returns the formatted object using all format functions
 */

const globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;

globalObj.tp_v = version;
globalObj.tp_debug = false;

const logger = {
  log: (...args) => {
    if (globalObj && globalObj.tp_debug === true) {
      console.debug('tp_debug is currently active');
      console.log(...args);
    } else {
      // do nothing
    }
  }
};

const formatAirlines = (obj) => {
  logger.log("Incoming obj: ", obj)
  if (
    obj.hasOwnProperty("module") &&
    obj.module != "" &&
    obj.hasOwnProperty("eventAction") &&
    obj.eventAction != ""
  ) {
    return (
      addParameters(obj),
      convertValues(obj),
      formatCase(obj),
      formatJourney(obj),
      formatFareClass(obj),
      formatTenantType(obj),
      formatDate(obj),
      formatUrl(obj),
      pushFormattedEventData(obj)
    );
  }
  return "Module name or eventAction missing.";
};

const formatHotels = (obj) => {
  logger.log("Incoming obj: ", obj)
  if (
    obj.hasOwnProperty("module") &&
    obj.module != "" &&
    obj.hasOwnProperty("eventAction") &&
    obj.eventAction != ""
  ) {
    return (
      convertValues(obj),
      formatCase(obj),
      formatTenantType(obj),
      formatDate(obj),
      formatUrl(obj),
      addCustomParameters(obj),
      pushFormattedEventData(obj)
    );
  }
  return "Module name or eventAction missing.";
}

const formatEvents = (obj) => {
  logger.log("Incoming obj: ", obj)
  if(
    obj.hasOwnProperty("module") &&
    obj.module != "" &&
    obj.hasOwnProperty("eventAction") &&
    obj.eventAction != ""
  )
   {
    return (
      convertValues(obj),
      formatJourney(obj),
      formatFareClass(obj),
      formatCase(obj),
      formatTenantType(obj),
      formatDate(obj),
      formatUrl(obj),
      pushFormattedEventData(obj)
    );
  }
  return "Module name or eventAction missing.";
};


/**
 * Adds moduleId and tagName parameters if they are not in the given object.
 * @param {object} obj - data layer object.
 * @return {object} - Returns the formatted object with the parameters as needed.
 */

const addParameters = (obj) => {
  if (!obj.hasOwnProperty("moduleId")) {
    obj.moduleId = "";
  }
  if (!obj.hasOwnProperty("tagName")) {
    obj.tagName = "";
  }
  return obj;
};

/**
 * Formats journey type to ONE_WAY or ROUND_TRIP.
 * @param {object} obj - data layer object.
 * @return {object} - Returns formatted journey type.
 */

const formatJourney = (obj) => {
  if (obj.hasOwnProperty("journeyType")) {
    if (obj.journeyType.match(/(oneway|one-way|one_way|ow|one way)/gi)) {
      obj.journeyType = "ONE_WAY";
    } else if (
      obj.journeyType.match(/(roundtrip|round-trip|round_trip|rt|round trip)/gi)
    ) {
      obj.journeyType = "ROUND_TRIP";
    } else {
      return (obj.journeyType = "");
    }
  }
  return obj;
};

/**
 * Formats fareClass to ECONOMY, BUSINESS, or FIRST.
 * @param {object} obj - data layer object.
 * @return {object} - Returns formatted fare class.
 */

const formatFareClass = (obj) => {
  if (obj.hasOwnProperty("fareClass")) {
    if (obj.fareClass.match(/(economy|ec|^e$)/gi)) {
      obj.fareClass = "ECONOMY";
    } else if (obj.fareClass.match(/(business|bc|^b$|businessclass)/gi)) {
      obj.fareClass = "BUSINESS";
    } else if (obj.fareClass.match(/(first|fc|^f$|firstclass)/gi)) {
      obj.fareClass = "FIRST";
    } else {
      obj.fareClass = "";
    }
  }
  return obj;
};

/**
 * Formats provider. Can only format the provider name if it is separated by spaces.
 * @deprecated - providers are now separated by spaces only
 * @param {object} obj - data layer object.
 * @return {object} - Returns formatted provider name.
 */

const formatProvider = (obj) => {
  if (obj.hasOwnProperty("provider")) {
    let airlineName = obj.provider;
    let finalAirlineName = "";

    if (airlineName.match(/[a-zA-Z0-9]+/g)) {
      const airlineArray = airlineName ? airlineName.split(" ") : [];
      if (airlineArray && airlineArray.length > 0) {
        airlineArray.forEach((key) => {
          finalAirlineName +=
            key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        });
        return (obj.provider = finalAirlineName);
      } else {
        return "";
      }
    }
  }
};

/**
 * Formats casing for different key values.
 * Events, eventAction - underscore
 * Module, actionLabel - kebab-case
 * lodging name - Titlecased
 * Rest - Capital
 * @param {object} obj - data layer object.
 * @return {object} - Returns case-converted object.
 */
const formatCase = (obj) => {
  
  let keyArr = [
    "event",
    "module",
    "eventAction",
    "airlineIataCode",
    "originAirportIataCode",
    "destinationAirportIataCode",
    "currencyCode",
    "route",
    "countryIsoCode",
    "cityCode",
    "languageIsoCode",
    "siteEdition",
    "name",
    "provider",
    "pageTypeCode",
    "pageTypeName",
    //Hotel values
    "tenantCode",
    "actionLabel",
    "regionName",
    "countryCode",
    "cityName",
    "propertyName",
    //Event values
    "eventName",
    "eventLocation",
    "eventSession",
    "eventExperienceCategory",
    "eventExperience"
  ];

  let listOfEvents = [
    "change-budget",
    "change-departure-date",
    "change-destination",
    "change-fare-class",
    "change-journey-type",
    "change-location",
    "change-miles",
    "change-month",
    "change-origin",
    "change-rating",
    "change-return-date",
    "change-status",
    "change-trip-length",
    "click-out",
    "collapse-form",
    "collapse-histogram",
    "expand-flight",
    "expand-form",
    "filter-airlines",
    "flight",
    "fsi",
    "more-deals",
    "open-booking-popup",
    "read-article",
    "reset-filter",
    "search-initiation",
    "search",
    "select-accessibility",
    "select-date",
    "select-end-date",
    "select-experience",
    "select-interest",
    "select-location",
    "select-map-destination",
    "select-month",
    "select-night",
    "select-offer",
    "select-property",
    "select-redemption",
    "select-room-guest",
    "select-start-date",
    "select-stay-length",
    "select-stop",
    "select-tab",
    "selected-travel-interest",
    "sort",
    "toggle-farelist",
    "viewable-impression",
    "select-article",
    "select-resident-status",
    "no-fares-available",
    "insert-first-name",
    "insert-last-name",
    "select-origin",
    "insert-email",
    "insert-phone-number",
    "subscribe",
    "enter-promo-code"
  ];

  const titleCase = [
    "regionName",
    "cityName",
    "propertyName",
    "eventName",
    "eventLocation",
    "eventSession",
    "eventExperienceCategory",
    "eventExperience",
    "provider"
  ];

  const toSnakeCase = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s.-]+/g, "_").toLowerCase();
  const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s._]+/g, "-").toLowerCase();
  const toTitleCase = (str) => str.replace(/\w\S*/g, match => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase());

  keyArr.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      if (key === "event") {
        const found = listOfEvents.includes(toKebabCase(obj[key]));
        if (!found) {
          obj[key] = "Event value does not exist";
          logger.log("Error: Please check event value");
        }else{
          obj[key] = toSnakeCase(obj[key])
        }
      } else if (key === "module" || key === "actionLabel") {
        obj[key] = toKebabCase(obj[key]);
      } else if (key === "eventAction") {
        obj.eventAction = obj.hasOwnProperty("event") && obj.event !== "" ? obj.event : obj.eventAction;
      } else if (titleCase.includes(key)) {
        if (key === "eventExperience" && obj[key].match(/(multiple|,)/gi)) {
          obj[key] = "MULTIPLE";
        } else {
          obj[key] = obj[key].toLowerCase().includes("n/a") ? "" : toTitleCase(obj[key]);
        }
      } else if (key === "pageTypeCode" || key === "pageTypeName") {
      obj[key] = toSnakeCase(obj[key]).toUpperCase();
      }
      else {
        obj[key] = obj[key].toUpperCase();
      }
    }

    if (obj.page !== undefined && obj.page[0]?.hasOwnProperty(key) && (key === "languageIsoCode" || key === "siteEdition" || key === "countryIsoCode")) {
      let siteEdition = toKebabCase(obj.page[0].siteEdition).split("-");
      obj.page[0].countryIsoCode = obj.page[0]?.countryIsoCode?.toUpperCase() ?? "";
      obj.page[0].languageIsoCode = obj.page[0]?.languageIsoCode?.toLowerCase() ?? "";
      obj.page[0].siteEdition = siteEdition[1] !== undefined
        ? siteEdition[0] + "-" + siteEdition[1].toUpperCase()
        : (obj.page[0].siteEdition === "" && obj.page[0].languageIsoCode && obj.page[0].countryIsoCode !== "")
        ? obj.page[0].languageIsoCode + "-" + obj.page[0].countryIsoCode
        : siteEdition[0] ?? "";
    }

    if (obj.lodging !== undefined && obj.lodging[0]?.hasOwnProperty(key)) {
      if (key === "cityCode") {
        obj.lodging[0].cityCode = obj.lodging[0]?.cityCode?.toUpperCase() ?? "";
      }
      if (key === "name") {
        obj.lodging[0].name = obj.lodging[0]?.name?.charAt(0).toUpperCase() + obj.lodging[0]?.name?.substr(1).toLowerCase() ?? "";
      }
    }
  });
  return obj;
}
/**
 * Formats date to ISO format.
 * @param {object} obj - data layer object.
 * @return {object} - Returns formatted dates.
 */

const formatDate = (obj) => {
  const dateFields = [
    "departureDate",
    "returnDate",
    "timestamp",
    "startDate",
    "endDate",
  ];

  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  const formatDateField = (field) => {
    if (obj.hasOwnProperty(field)) {
      let value = obj[field];
      if (value !== '' && value !== undefined) {
        if (field === 'timestamp') {
          value = new Date(value);
          value = isValidDate(value) ? value.toISOString() : '';
        } else {
          value = new Date(value);
          value = isValidDate(value) ? value.toISOString().substr(0, 10) : '';
        }
      } else {
        value = '';
      }
      obj[field] = value;
    }
  };

  for (const key of dateFields) {
    formatDateField(key);
  }

  if (obj.lodging !== undefined && obj.lodging.length > 0) {
    const lodgingObj = obj.lodging[0];

    if (lodgingObj) {
      if (lodgingObj.hasOwnProperty("startDate")) {
        const startDateValue = new Date(lodgingObj.startDate);
        lodgingObj.startDate = isValidDate(startDateValue) ? startDateValue.toISOString().substr(0, 10) : '';
      }
      if (lodgingObj.hasOwnProperty("endDate")) {
        const endDateValue = new Date(lodgingObj.endDate);
        lodgingObj.endDate = isValidDate(endDateValue) ? endDateValue.toISOString().substr(0, 10) : '';
      }
    }
  }

  return obj;
};


/**
 * Checks whether the document/page is in an iFrame
 * @return {boolean} - Returns truthy or falsy value
 */
const checkIframe = () =>{
  try{
    if(window.self !== window.top || window.location !== window.parent.location){
      return true
    }
    else{
      return false
    }
  }catch(e){
    return true
  }
}

/**
 * Formats url spacing.
 * @param {object} obj - data layer object.
 * @return {object} - Returns url spaced between : and /.
 */
const formatUrl = (obj) => {
  if (obj.hasOwnProperty("url")) {
    if(checkIframe()){
      obj.url = (window.parentURL !== '') ? window.parentURL : document.referrer || window.parent.location.href
    }
    else if(obj["url"] !== ''){
      obj.url
    }
    else{
      obj.url = document.location.href
    }
    obj.url = obj.url.split(":").join(": ");
  }
  return obj;
};

/**
 * Adds custom parameters to the data layer object.
 * @param {object} obj - data layer object.
 * @return {object} - Returns url spaced between : and /.
 */
const addCustomParameters = (obj) => {
  // Add daysUntilBooking parameter
  if (!obj.hasOwnProperty("daysUntilBooking") && obj.hasOwnProperty("startDate") && obj.startDate !== "") {
    const startDate = new Date(obj.startDate);
    const today = new Date();
    const timeDiff = startDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    obj['daysUntilBooking'] = daysDiff;
  }
  return obj;
};

/**
 * Recursive Function.
 * Replaces null values to empty string.
 * Converts numeric string values to their number value.
 * Converts true/false string values to their boolean values
 * @param {object} obj - data layer object.
 * @return {object} - Returns formatted object.
 */
const convertValues = (obj) => {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] === "object") {
        convertValues(obj[property]);
        if (obj[property] == null || !obj[property]) {
          obj[property] = "";
        }
      } else if (typeof obj[property] === "string") {
        if (!isNaN(obj[property]) && !isNaN(parseFloat(obj[property]))) {
          obj[property] = +obj[property];
        } else if (obj[property] === "false" || obj[property] === "true") {
          obj[property] = obj[property].toLowerCase() === "true" ? true : false;
        }
      } else if (typeof obj[property] === "number") {
        obj[property] = Math.round(obj[property] * 100) / 100;
      } else {
        // Default the property to an empty string if it's not a string
        obj[property] = "";
      }
    }
  }
  return obj;
};


/**
 * Returns tenant type based on tenant code. Checks whether tenant code belongs in tenant list. 
 * @param  {object} obj - formatted object
 * @return {object} - returns object containing tenant type
 */
const formatTenantType = (obj) => {
  const tenantCode = obj.hasOwnProperty("tenantCode ") ? obj["tenantCode"] : obj.hasOwnProperty("airlineIataCode") ? obj["airlineIataCode"] : "";
  if (typeof tenantCode === "string" && tenantCode.length > 0) {
    const tenantCodeSubstr = tenantCode.substring(0, tenantCode.length - 1); // Take substring for customers with multiple tenants

    //Check if tenant belongs in list
    if (Object.keys(tenantList).includes(tenantCode)) {
      return (obj.tenantType = tenantList[tenantCode]);
    }
    //If the tenant code does not belong to list
    else if (!Object.keys(tenantList).includes(tenantCode)) {
      //Check if substring of tenant code belongs in list
      if (Object.keys(tenantList).includes(tenantCodeSubstr)) {
        return (obj.tenantType = tenantList[tenantCodeSubstr]);
      } else {
        switch (tenantCode[0]?.toUpperCase()) {
          case "A":
            obj.tenantType = "airline";
            break;
          case "X":
            obj.tenantType = "airline alliance";
            break;
          case "L":
            obj.tenantType = "airport";
            break;
          case "P":
            obj.tenantType = "package";
            break;
          case "H":
            obj.tenantType = "hotel";
            break;
          case "E":
            obj.tenantType = "event";
            break;
          case "B":
            obj.tenantType = "bus";
            break;
          case "D":
            obj.tenantType = "tourism board & dmo";
            break;
          case "T":
            obj.tenantType = "train";
            break;
          default:
            obj.tenantType = "";
            logger.log("tenantCode does not adhere to the naming convention.");
        }
      }
    } else {
      obj.tenantType = "";
      logger.log("Invalid tenantCode: Not a non-empty string.");
    }
    return obj;
  }
};
/**
 * Pushes formatted object to datalayer
 * @param  {object} obj - formatted object
 */
const pushFormattedEventData = (obj) => {
  if (!window) {
    error('window is not defined');
  } else {
    logger.log("Formatted event obj: ", JSON.parse(JSON.stringify(obj)))
    if (window.utag) {
      window.utag.link(obj);
    }
    if (window.dataLayer) {
      if(window.localDataLayer && window.localDataLayer.length > 0) {
        window.dataLayer.push(...window.localDataLayer);
        window.localDataLayer = [];
      }
      window.dataLayer.push(obj);  
    } else {
      window.localDataLayer = [];
      window.localDataLayer.push(obj);
    }
  }
};

const formatter = { formatAirlines, formatHotels, formatEvents };

export { formatter }
export default formatter