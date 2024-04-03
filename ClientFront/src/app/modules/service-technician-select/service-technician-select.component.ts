import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Constants } from 'src/app/shared/constants/constants';
import { Category } from 'src/app/shared/models/category';
import { Project } from 'src/app/shared/models/project';
import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import { UserService } from 'src/app/shared/services/user.service';
import { HttpClient } from '@angular/common/http';
@Component({
    selector: 'app-service-technician-select',
    templateUrl: './service-technician-select.component.html',
    styleUrls: ['./service-technician-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceTechnicianSelectComponent implements OnInit {
    public professionals: User[];
    public filteredProfessionals: User[];
    public selectedTechID?: string;
    public categorySelection: string;
    public serviceSelection: string;
    public categories: Category[];
    public range: number = 10;
    public selectedOption: string = '';
    public starRating: number;
    public clientName: string;
    public clientEmail: string;
    public skill: string;
    
    // toggle visibilty variables
    public searchFeedback: string;
    public isFeedbackVisible: boolean = false;
    public isShowMoreBtnVisible: boolean = false;
    public isCardListVisible: boolean = false;

    // geolocation variables
    public latitude: number = 0;
    public longitude: number = 0;
    public areaCode: string;
    // public canadaPostalCodeRegex: RegExp = new RegExp('^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z][ -]?[0-9]??[ABCEGHJ-NPRSTV-Z]??[0-9]??$', 'im');
   //  public usZipCodeRegex: RegExp = new RegExp('^[0-9]{5}(?:[ -][0-9]{4})?$', 'im');
    public googleMapApiUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json'; 
    private googleMapApiKey: string = 'AIzaSyDS_bEoW2tmdRW-WyWaZIS_gnsbWQ1stUU';

    //Options for selecting range for techie location.
    options = [
        { name: "10", value: 10 },
        { name: "20", value: 20 },
        { name: "50", value: 50 },
        { name: "100", value: 100 },
        { name: "All", value: 9999999 }
    ]

    //check for change in selected range (km).
    onOptionsSelected(){
        if (this.selectedOption == "All") {
            this.range = 9999999;
        } else {
            this.range = parseInt(this.selectedOption);
        }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        private translateService: TranslateService,
        private userService: UserService,
        private authService: AuthService,
        private projectService: ProjectService,
        private categoryService: CategoryService,
        private changeDetectorRef: ChangeDetectorRef,
        private http: HttpClient,
    ) {
        this.route.queryParams.subscribe((params) => {
            this.categorySelection = params.category;
            this.serviceSelection = params.service;
        });
    }

    public ngOnInit(): void {
        this.getAreaCode();
    }

    /**
     * Get the selected techie and create project listing.
     */
    public techSelect(id: string): void {
        this.selectedTechID = id;
        this.createProject();
    }

    public techSelectDetails(pro: User): void {
        this.selectedTechID = pro._id;
        const categoryId = this.categories.find(
            (c) => c.name === this.categorySelection
        )?._id;
        const serviceId = this.categories
            .find((c) => c._id === categoryId)
            ?.services.find((s) => s.name === this.serviceSelection)?._id;

        const serviceName = this.serviceSelection;
        console.log(categoryId + " " + serviceId + " " + serviceName)
        this.router.navigateByUrl('/proDetails', { state: {pro, categoryId, serviceId, serviceName }});
        // this.router.navigateByUrl('/proDetails', { state: this.pro });
        // this.createProject();
    }



    
    notifyAdmin(): void {
        this.authService.notifyAdmin(this.clientName, this.clientEmail, this.skill).subscribe({
            next: (response) => {
                console.log('Admin notified successfully', response);
                this.snackBar.open('The admin has been notified!', 'Close', { duration: 3000 });
            },
            error: (error) => {
                console.error('Error notifying admin:', error);
            }
        });
    }

      
    

      
      
    /**
     * Create a project listing with selected techie and redirect user to project page.
     */
    public createProject(): void {
        this.authService.user.pipe(first()).subscribe((user: User | null) => {
            const clientId = user?._id;
            const professionalId = this.selectedTechID;
            const serviceName = this.serviceSelection;
            const categoryId = this.categories.find(
                (c) => c.name === this.categorySelection
            )?._id;
            const serviceId = this.categories
                .find((c) => c._id === categoryId)
                ?.services.find((s) => s.name === this.serviceSelection)?._id;

            if (!clientId) {
                console.warn(
                    "You're not logged in, please log in and try it again"
                );

                this.translateService
                    .get('Message.SignInFirst')
                    .pipe(first())
                    .subscribe((translation) => {
                        const config = new MatSnackBarConfig();
                        config.duration = Constants.ShortDuration;

                        this.snackBar.open(translation, 'OK', config);
                    });
            } else if (
                clientId &&
                professionalId &&
                serviceName &&
                categoryId &&
                serviceId
            ) {
                this.projectService
                    .create(
                        categoryId,
                        serviceId,
                        serviceName,
                        professionalId,
                        clientId
                    )
                    .subscribe((project: Project) => {
                        this.router.navigateByUrl(`/project/${project._id}`);
                    });
            } else {
                console.warn(
                    'ServiceTechnicianSelectComponent: createProject: some data is missing'
                );
            }
        });
    }

    /**
     * Get list of techies and categories based on selected category, range, and current coordinates.
     */
    private async getStaticData() {
        return new Promise((resolve, reject) => {
            forkJoin([
                this.userService.getAllProfessionalsBySkill(this.serviceSelection, this.range, this.latitude, this.longitude),
                this.categoryService.getAll(),
            ])
                .pipe(
                    map(([users, categories]) => {
                        console.log("Raw professionals data:", users); 
                        console.log("Raw categories data:", categories);
    
                        for(let i=0; i<users.length; i++) {
                            if (users[i].ratingSum == 0 || users[i].ratingSum == null) {
                                users[i].rating = "No reviews yet!";
                            } else {
                                users[i].rating = (users[i].ratingSum / users[i].ratingCount).toFixed(2); 
                            }
                        }
                        this.professionals = users;
                        this.categories = categories;
    
                        console.log("Processed professionals data:", this.professionals); 
                        this.professionals.forEach(pro => {
                            console.log(`Processed professional: ${pro.firstName}, Rating: ${pro.rating}`);
                        });
                    })
                )
                .subscribe(() => {
                    console.log("Data ready for rendering.");
                    this.changeDetectorRef.markForCheck();
                    resolve('success');
                    console.log("Final list of professionals for rendering:", this.professionals);

                }, error => {
                    console.error("Failed to fetch data:", error); 
                    reject(error);
                });
        });
    }
    
    private calculateRating(sum: number, count: number) {
        return sum / count;
    }
    

    /**
     * Find and filter techies based on area code and distance parameters.
     */
    public async findTechs() {
        this.isCardListVisible = false;
        this.isFeedbackVisible = false;
        this.isShowMoreBtnVisible = false;
    
        try {
            const geoCodeResponse = await this.getCoordinates();
            if (geoCodeResponse === "ZERO_RESULTS") {
                throw new Error('Area code not found');
            } else {
                await this.getStaticData();
                this.displayTechs();
            }
        } catch (error: any) {
            this.searchFeedback = "Try again - " + error.message;
            this.isFeedbackVisible = true;
        }
    }
    

    /**
     * Toggle the cardList visibility and shows the top 3 results.
     */
    public displayTechs(){
        this.isCardListVisible = true;

        if (this.professionals.length > 3) {
            this.filteredProfessionals = this.professionals.slice(0, 3);
            this.isShowMoreBtnVisible = true;
        } else {
            this.filteredProfessionals = this.professionals;
        }
        
        if (this.professionals.length === 0) {
            this.searchFeedback = 'No Technicians found, please change distance radius';
            this.isFeedbackVisible = true;
        }
    }



    public sortOption: string = ''; 

    public sortProfessionals(): void {
        this.filteredProfessionals.sort((a, b) => {
          const ratingA = a.ratingCount > 0 ? a.ratingSum / a.ratingCount : 0;
          const ratingB = b.ratingCount > 0 ? b.ratingSum / b.ratingCount : 0;
                switch (this.sortOption) {
            case 'ratingDesc':
              return ratingB - ratingA;
            case 'ratingAsc':
              return ratingA - ratingB;
            case 'priceDesc':
              return b.unitPrice - a.unitPrice;
            case 'priceAsc':
              return a.unitPrice - b.unitPrice;
            default:
              return 0; 
          }
        });
      
        this.changeDetectorRef.markForCheck(); 
      }
      

    /**
     * Toggle the showMore button visibility and displays all current professionals.
     */
    public showMore() {
        this.isShowMoreBtnVisible = false;
        this.filteredProfessionals = [...this.professionals]; 
        this.sortProfessionals(); 
    }

    /**
     * Return the current geolocation position object.
     */
    public getGeoLocation() {
        return new Promise((resolve, reject) => {
            return navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    /**
     * Get geo coordinates from area code with reverse geocoding and return the response status.
     */
    public async getCoordinates(){
        return new Promise((resolve, reject) => {
            let url = `${this.googleMapApiUrl}?address=${this.areaCode}&key=${this.googleMapApiKey}`;
            this.http.get(url).subscribe((response: any) => {
                console.log("Geocoding response:", response); // Log the full response
    
                if (response.status === "ZERO_RESULTS") {
                    this.latitude = 0;
                    this.longitude = 0;
                    console.log("No results found for this area code."); // Log no results
                } else if (response.results && response.results.length > 0) {
                    let results = response.results;
                    this.latitude = results[0].geometry.location.lat;
                    this.longitude = results[0].geometry.location.lng;
                    console.log("Coordinates found:", this.latitude, this.longitude); // Log the coordinates
                } else {
                    console.log("Unexpected response format:", response); // Log unexpected format
                }
                resolve(response.status);
            }, error => {
                console.error("Error during geocoding:", error); // Log any errors
                reject(error);
            });
        })
    }
    

    /**
     * Get the area code with current geolocation coordinates.
     */
    public async getAreaCode() {
        try {
            let position: any = await this.getGeoLocation();
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;

            let url = `${this.googleMapApiUrl}?latlng=${this.latitude},${this.longitude}&key=${this.googleMapApiKey}`;
            this.http
                .get(url)
                .subscribe((res: any) => {
                    let addressData: any = res.results[0].address_components;
                    this.areaCode = addressData[addressData.length - 1].long_name.split(" ", 1);
                }
            )
        } catch (error) {
            console.log("Current geolocation coordinates not found");
        }
    }
}