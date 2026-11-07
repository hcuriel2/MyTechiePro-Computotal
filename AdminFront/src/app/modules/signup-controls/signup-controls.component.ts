import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
interface Settings { clientEnabled: boolean; professionalEnabled: boolean; clientNotice: string; professionalNotice: string; }
@Component({ selector: 'app-signup-controls', templateUrl: './signup-controls.component.html', styles: ['section { max-width: 820px; margin: 32px auto; padding: 24px; } fieldset { margin: 24px 0; padding: 20px; border: 1px solid #ccd5df; border-radius: 8px; } textarea { display: block; width: 100%; min-height: 88px; margin: 12px 0; } button { padding: 10px 24px; } .status { white-space: pre-wrap; }'] })
export class SignupControlsComponent implements OnInit {
    settings: Settings | null = null;
    saving = false;
    message = '';
    constructor(private http: HttpClient) {}
    ngOnInit(): void { this.load(); }
    load(): void {
        this.message = 'Loading signup settings…';
        this.http.get<Settings>(environment.apiEndpoint + '/signup-settings', { withCredentials: true }).subscribe(value => { this.settings = value; this.message = ''; }, () => { this.message = 'Could not load settings. Retry before editing.'; });
    }
    save(): void {
        if (!this.settings || this.saving) { return; }
        this.saving = true; this.message = '';
        this.http.put<Settings>(environment.apiEndpoint + '/signup-settings', this.settings, { withCredentials: true }).subscribe(value => { this.settings = value; this.saving = false; this.message = 'Signup settings saved.'; }, error => { this.saving = false; this.message = error.status === 401 || error.status === 403 ? 'An authenticated Admin session is required to save.' : 'Settings were not saved. Please retry.'; });
    }
}
