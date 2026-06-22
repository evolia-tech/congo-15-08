import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ParticipationService } from '../../services/participation.service';
import { ImageComposerService } from '../../services/image-composer.service';
import { ShareModalComponent } from '../share-modal/share-modal.component';

@Component({
  selector: 'app-participation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Select,
    Textarea,
    FloatLabel,
    ShareModalComponent
  ],
  templateUrl: './participation-form.component.html',
  styleUrl: './participation-form.component.scss',
})
export class ParticipationFormComponent implements OnInit {
  @Input() compact: boolean = false;
  @Output() submitSuccess = new EventEmitter<{ firstName: string, location: string }>();

  participationForm!: FormGroup;
  imagePreview: string | null = null;
  isSubmitting = false;

  // Share modal state
  showShareModal = false;
  composedImageDataUrl = '';
  composedFileName = 'flamme-congo.png';
  modalFirstName = '';
  modalMessage = '';

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
    private imageComposer: ImageComposerService
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
    
    this.isSubmitting = true;
    const formValue = this.participationForm.value;
    
    const payload = {
      firstName: formValue.firstName,
      email: formValue.email,
      countryId: formValue.country.code,
      department: formValue.department ? formValue.department.name : undefined,
      message: formValue.message,
      photo: formValue.photo
    };

    // Capture image preview BEFORE resetting the form
    const photoDataUrl = this.imagePreview || '';

    this.participationService.submitParticipation(payload).subscribe({
      next: async (response) => {
        this.isSubmitting = false;
        
        const location = payload.department ? payload.department : formValue.country.name;
        this.submitSuccess.emit({ firstName: payload.firstName, location });
        
        this.participationForm.reset();
        this.imagePreview = null;

        // Generate the composed image and show the share modal
        if (photoDataUrl) {
          try {
            const composed = await this.imageComposer.compose({
              photoDataUrl,
              firstName: payload.firstName,
              message: payload.message,
              location
            });
            this.composedImageDataUrl = composed.dataUrl;
            this.composedFileName = composed.fileName;
            this.modalFirstName = payload.firstName;
            this.modalMessage = payload.message;
            this.showShareModal = true;
          } catch (err) {
            console.error('Image composition failed:', err);
          }
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Erreur lors de l'enregistrement : ${err.message}`);
      }
    });
  }

  closeShareModal(): void {
    this.showShareModal = false;
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
