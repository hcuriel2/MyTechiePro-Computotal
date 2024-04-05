// @ts-ignore
import { Component, OnInit } from "@angular/core";
import { Options } from "ngx-google-places-autocomplete/objects/options/options";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  title = "google-places-autocomplete";
  userAddress: string = "";
  userLatitude: string = "";
  userLongitude: string = "";

  userCountry: string = "";
  userPostal: string = "";
  userCity: string = "";
  userStreetAddress: string = "";

  options: Options = {
    bounds: undefined!,
    fields: ["ALL"],
    strictBounds: false,
    types: ["address"],
    origin: undefined!,
    componentRestrictions: undefined!,
  };

  constructor() {}

  ngOnInit(): void {}

  handleAddressChange(address: any) {
    let addressComponents = address.address_components;
    

    this.userAddress = address.formatted_address;
    this.userLatitude = address.geometry.location.lat();
    this.userLongitude = address.geometry.location.lng();

    let streetNumber;
    let streetName;

    for (let i = 0; i < addressComponents.length; i++) {
      let types = addressComponents[i].types;
      for (let j = 0; j < types.length; j++) {
        if (types[j] == "country") {
          this.userCountry = addressComponents[i].long_name;
        }
        if (types[j] == "postal_code") {
          this.userPostal = addressComponents[i].long_name;
        }
        if (types[j] == "locality") {
          this.userCity = addressComponents[i].long_name;
        }
        if (types[j] == "street_number") {
          streetNumber = addressComponents[i].long_name;
        }
        if (types[j] == "route") {
          streetName = addressComponents[i].long_name;
        }
      }
      this.userStreetAddress = streetNumber + " " + streetName;
    }
    
    
    
    
    
    // this.userCountry = address.geometry.location.country()
  }
}
