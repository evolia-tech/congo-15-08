import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ParticipationService } from '../../services/participation.service';
import { ImageComposerService } from '../../services/image-composer.service';

@Component({
  selector: 'app-participation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Select,
    Textarea,
    FloatLabel
  ],
  templateUrl: './participation-form.component.html',
  styleUrl: './participation-form.component.scss',
})
export class ParticipationFormComponent implements OnInit {
  @Output() submitSuccess = new EventEmitter<{ firstName: string, location: string }>();

  participationForm!: FormGroup;
  imagePreview: string | null = null;
  isSubmitting = false;
  submissionError: string | null = null;


  countries = [
    { name: 'République du Congo', code: 'CG' },
    { name: 'France', code: 'FR' },
    { name: 'Belgique', code: 'BE' },
    { name: 'Canada', code: 'CA' },
    { name: 'États-Unis', code: 'US' },
    { name: 'Sénégal', code: 'SN' },
    { name: 'Côte d\'Ivoire', code: 'CI' },
    { name: 'Cameroun', code: 'CM' },
  ];

  departments = [
    { name: 'Brazzaville' },
    { name: 'Pointe-Noire' },
    { name: 'Kouilou' },
    { name: 'Niari' },
    { name: 'Bouenza' },
    { name: 'Lékoumou' },
    { name: 'Pool' },
    { name: 'Plateaux' },
    { name: 'Cuvette' },
    { name: 'Cuvette-Ouest' },
    { name: 'Sangha' },
    { name: 'Likouala' }
  ];

  constructor(
    private fb: FormBuilder,
    private participationService: ParticipationService,
    private imageComposer: ImageComposerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.participationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      country: [null, [Validators.required]],
      department: [null],
      message: ['', [Validators.required, Validators.maxLength(120)]],
      photo: [null, [Validators.required]]
    });

    this.participationForm.get('country')?.valueChanges.subscribe((country) => {
      const deptControl = this.participationForm.get('department');
      if (country && country.code === 'CG') {
        deptControl?.setValidators([Validators.required]);
      } else {
        deptControl?.clearValidators();
        deptControl?.setValue(null);
      }
      deptControl?.updateValueAndValidity();
    });
  }

  get showDepartment(): boolean {
    const country = this.participationForm.get('country')?.value;
    return country && country.code === 'CG';
  }

  get messageLength(): number {
    return this.participationForm.get('message')?.value?.length || 0;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      this.participationForm.patchValue({ photo: file });
      this.participationForm.get('photo')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imagePreview = null;
    this.participationForm.patchValue({ photo: null });
    this.participationForm.get('photo')?.updateValueAndValidity();
    
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.participationForm.invalid) {
      this.markFormGroupTouched(this.participationForm);
      return;
    }
    
    this.submissionError = null;
    this.isSubmitting = true;
    const formValue = this.participationForm.value;
    const location = formValue.department ? `${formValue.department.name}, Congo` : formValue.country.name;
    const photoDataUrl = this.imagePreview || '';

    if (!photoDataUrl) {
      this.isSubmitting = false;
      this.submissionError = 'Veuillez sélectionner une photo.';
      return;
    }

    // 1. Generate the composed image canvas first client-side
    const stats = this.participationService.stats();
    const flameNumber = (stats?.totalParticipations || 0) + 1;

    this.imageComposer.compose({
      photoDataUrl,
      firstName: formValue.firstName,
      message: formValue.message,
      location,
      flameNumber
    }).then((composed) => {
      // 2. Convert base64 data URL to a File object
      const cardFile = this.dataURLtoFile(composed.dataUrl, composed.fileName);

      const payload = {
        firstName: formValue.firstName,
        email: formValue.email,
        countryId: formValue.country.code,
        department: formValue.department ? formValue.department.name : undefined,
        message: formValue.message,
        card: cardFile
      };

      // 3. Submit to the backend
      this.participationService.submitParticipation(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          this.submitSuccess.emit({ firstName: payload.firstName, location });
          
          // Save to local storage cache
          this.participationService.addLocalParticipation({
            id: response.id,
            firstName: response.firstName,
            location: location,
            cardUrl: response.cardUrl || null,
            dataUrl: composed.dataUrl,
            message: payload.message
          });

          // Open the global share modal
          this.participationService.openShareModal(response.id);
          
          this.participationForm.reset();
          this.imagePreview = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.submissionError = err.message || 'Une erreur est survenue lors de l\'enregistrement.';
          this.cdr.detectChanges();
        }
      });
    }).catch((err) => {
      this.isSubmitting = false;
      this.submissionError = err.message || 'Erreur de génération graphique.';
      this.cdr.detectChanges();
    });
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
