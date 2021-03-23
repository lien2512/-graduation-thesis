import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SubjectService } from './subject.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private toastr: ToastrService,
    private subjectService: SubjectService) { }
  showSuccess(title, content, options = null) {
    this.toastr.success(content, title, options = null);
  }
  showError(title, content, options = null) {
    this.toastr.error(content, title, options = null);
  }
  showFullLoading() {
    this.subjectService.fullLoading.next(true);
  }
  hideFullLoading() {
    this.subjectService.fullLoading.next(false);
  }
  markFormGroupTouched(formGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
