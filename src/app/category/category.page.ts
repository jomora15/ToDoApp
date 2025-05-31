import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonFab, IonFabButton, IonModal, IonIcon,
  IonInput, IonButton, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, createOutline, trashOutline, informationCircleOutline } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-category',
  templateUrl: 'category.page.html',
  styleUrls: ['category.page.scss'],
  imports: [IonButton, IonInput, IonIcon, IonModal, IonFabButton, IonFab, IonLabel, IonItem, IonList, IonHeader,
    IonToolbar, IonTitle, IonContent, ReactiveFormsModule, IonText]
})
export class CategoryPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  private storageService = inject(StorageService);
  categories: any[] = [];
  keyCategoriesList = "categoriesList";
  keyTasksList = "tasksList";
  categoryForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    addIcons({ createOutline, trashOutline, addCircleOutline, informationCircleOutline });

    this.categoryForm = _formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      id: [null]
    });
  }

  ngOnInit(): void {
    this.categories = this.storageService.getAllItems(this.keyCategoriesList);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.categoryForm.reset();
  }

  save() {
    console.log(this.categoryForm.getRawValue().id);

    let option = this.categoryForm.getRawValue().id == null ? 'confirm' : 'update';

    this.modal.dismiss(this.categoryForm.getRawValue(), option);
  }

  edit(category: any) {
    this.categoryForm.patchValue({ name: category.name, id: category.id });

    this.modal.present();
  }

  removeCategory(id: number) {
    this.categories = this.categories.filter(category => category.id !== id);

    this.storageService.setManyItems(this.categories, this.keyCategoriesList);

    this.categories = this.storageService.getAllItems(this.keyCategoriesList);

    //Actualizo las tareas que pertenecían a la categoria eliminada
    let tasks = this.storageService.getAllItems(this.keyTasksList);

    let updateTasks = tasks.map(task => {
      if (task.categoryId === id.toString()) {
        return { ...task, categoryId: '' }
      }

      return task;
    });

    this.storageService.setManyItems(updateTasks, this.keyTasksList);

  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.storageService.setOneItem({ name: event.detail.data?.name, id: event.detail.data?.id }, this.keyCategoriesList);
    } else {
      this.storageService.updateOneItem({ name: event.detail.data?.name, id: event.detail.data?.id }, this.keyCategoriesList);
    }

    this.categories = this.storageService.getAllItems(this.keyCategoriesList);

    this.categoryForm.reset();
  }
}
