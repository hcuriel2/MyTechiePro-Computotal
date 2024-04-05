import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CreateCategoryService } from 'src/app/shared/services/create-category.service';
import { Category } from 'src/app/shared/models/create-category';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss'],
})
export class CreateCategoryComponent implements OnInit {
  constructor(private createCategoryService: CreateCategoryService, private router: Router) { }

  ngOnInit(): void {
  }

  newCategoryNameFromInput: string = "";
  newMaterialIconFromInput: string = "";
  newServicesFromInput: string = "";
  newServicesFromInputArr: string[] = [];

  //created an empty object of type Category
  category: Category = {
    name: '',
    icon: '',
    services: [],
  };

  onClicked(value: string) {
    this.newCategoryNameFromInput = value;
    
    
  }
  onClicked2(value: string) {
    this.newMaterialIconFromInput = value;
  }
  onClicked3(value: string) {
    this.newServicesFromInput = value;
  }

  loggingValue() {
    
    
    

    this.newServicesFromInputArr = this.newServicesFromInput!.split(',');
    

    const tryObject = { "test": "hello", "work": "please" };

    //inject the values from the input fields into the category object
    if (this.newCategoryNameFromInput != "" && this.newCategoryNameFromInput != null && this.newMaterialIconFromInput != "" && this.newMaterialIconFromInput != null && this.newServicesFromInput != "" && this.newServicesFromInput != null) {
      this.category.name = this.newCategoryNameFromInput;
      this.category.icon = this.newMaterialIconFromInput;
      this.category.services = this.newServicesFromInputArr;

    //create a servies array that dynmiaclly creates services objects from the services array
    this.category.services = this.newServicesFromInputArr.map(function (service) {
      return {
        name: service,
        keywords: ["keyword1", "keyword2"],
      };
    });
    
    this.createCategoryService.createANewCategory(this.category).subscribe((data: Category) => {
      
    }
    );
    //route back to the admin dashboard
    //this.router.navigate(['/admin-dashboard']);
    this.router.navigateByUrl('/');
    }
  }

}