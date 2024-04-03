/**
 * Fake database surveys representing the actual structure they
 * will be in the database.
 *
 * Consists of nested JSON objects for variable survey lengths and questions
 * within the same category. Every survey needs "q" and "content" keys.
 * Content consists of a JSON object with all answers as keys with a value
 * of either a empty JSON object {} or another question which will have
 * another "q" and "content".
 *
 * The nesting can be continued for any number of questions.
 */

export var fakeSurveyData: any = {
  //   GenericCategory: {
  //     category: "Generic Category",
  //     survey: {
  //       q: "Choose a subcategory",
  //       key: "subCategory",
  //       content: {
  //         Apples: {},
  //         Bananas: {},
  //         Orange: {},
  //         Pinapples: {},
  //         Grapes: {},
  //       },
  //     },
  //   },
  //   Hardware: {
  //     category: "Hardware",
  //     survey: {
  //       q: "What hardware service is needed?",
  //       key: "subCategory",
  //       content: {
  //         "Personal computers (PCs) repair": {},
  //         "Servers’ implementation / customization": {},
  //         "Peripherals and components": {},
  //         "Data storage systems, printer, scanners, etc.": {},
  //         "Removal and recycling services": {},
  //       },
  //     },
  //   },
  //   Software: {
  //     category: "Software",
  //     survey: {
  //       q: "What software service is needed?",
  //       key: "subCategory",
  //       content: {
  //         "System and infrastructure software": {},
  //         "Software tools": {},
  //         "Custom applications / software development": {},
  //       },
  //     },
  //   },
  //   ITServices: {
  //     category: "IT Services",
  //     survey: {
  //       q: "What IT service is needed?",
  //       key: "subCategory",
  //       content: {
  //         "Hardware installation / technical support": {},
  //         "Software installation / technical support": {},
  //         "System and network integration": {},
  //         "Consulting and software customization": {},
  //         Training: {},
  //         "IT Consulting": {},
  //         "Business application consulting / outsourcing": {},
  //         "IT management": {},
  //         "Data recovery": {},
  //         Leasing: {},
  //       },
  //     },
  //   },
  //   Telecommunications: {
  //     category: "Telecommunications",
  //     survey: {
  //       q: "What Telecommunication service is needed?",
  //       key: "subCategory",
  //       content: {
  //         "Communication services": {},
  //         Telephony: {},
  //         "Data communications equipment": {},
  //         "Local networks / VPNs": {},
  //         "Global information networks including Web": {},
  //       },
  //     },
  //   },
  //   CloudServices: {
  //     category: "Cloud Services",
  //     survey: {
  //       q: "What Cloud services are needed?",
  //       key: "subCategory",
  //       content: {
  //         "email migration (Office 365, Gmail)": {},
  //         "Apps migration (AWS, g-Suite, Azure)": {},
  //         "Cloud-based applications": {},
  //         "Remote networks / biz implementation": {},
  //         "Web based marketing / eCommerce": {},
  //         "Online data backup implementation / outsourcing": {},
  //       },
  //     },
  //   },
  //   SurveillanceServices: {
  //     category: "Surveillance Services",
  //     survey: {
  //       q: "What Surveillance Services are needed?",
  //       key: "subCategory",
  //       content: {
  //         "Procurement and installation services": {},
  //         "Outsourced / managed": {},
  //       },
  //     },
  //   },
  //   MediaCenter: {
  //     category: "Media Center",
  //     survey: {
  //       q: "What Media Center service is needed?",
  //       key: "subCategory",
  //       content: {
  //         "Video and Audio installation services": {},
  //         "Aerial recording": {},
  //       },
  //     },
  //   },
};
