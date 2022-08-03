from django import forms

class AddressForm(forms.Form):
    addr = forms.CharField(label="Address", max_length=250)