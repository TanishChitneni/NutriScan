import requests
import re
from bs4 import BeautifulSoup

code = "0052000043594"
r = requests.get("https://world.openfoodfacts.org/api/v3/product/"+str(code)+".json")
soup = BeautifulSoup(r.text, "html.parser")
a = soup.text

#Ingreidents

s = ""
x = a.find('ingredients_text"')
a = a[x: len(a)]
# print(a)
ingre = a[a.find(':')+1:a.find('."')]
while (ingre.find('(') != -1 and ingre.find('[')!=-1):
    y = ingre[min(ingre.find('('), ingre.find('['))+1:min(ingre.find(')'), ingre.find(']'))].split(', ')
    for i in y:
        s += i+" "
    ingre = ingre[min(ingre.find(')'), ingre.find(']'))+1: len(ingre)]
    
    # print(ingre)
    s.replace('(', '')
    s.replace(')', '')
    s.replace('[', '')
    s.replace(']', '')
    s.replace('(', '')
    s.replace(')', '')
    s.replace('[', '')
    s.replace(']', '')
s = re.sub(r"[\(\)\[\]]", "", s)
# print(s)

x = a.find("nutriments")
a = a[x: len(a)]

# print(ingre)

# Carbohydrate:
x = a.find("carbohydrates")
a = a[x: len(a)]
# print(a)
#sugars, sodium
carbohydrate = a[a.find(":")+1:a.find(",")]

# Energy:
x = a.find("energy-kcal")
a = a[x:len(a)]
energy = a[a.find(':')+1:a.find(',')]

#Fat
x = a.find("fat")
a = a[x:len(a)]
fat = a[a.find(':')+1:a.find(',')]

#protein
x = a.find("protein")
a = a[x:len(a)]
protein = a[a.find(':')+1:a.find(',')]
#sodium
x = a.find("sodium")
a = a[x:len(a)]
sodium = a[a.find(':')+1:a.find(',')]
#sugars
x = a.find("sugar")
a = a[x:len(a)]
sugar = a[a.find(':')+1:a.find(',')]

def ret():
    global energy, sugar, sodium, fat, carbohydrate, protein
    return [float(energy), float(sugar), float(sodium), float(fat), float(carbohydrate), float(protein)]
print(ret())
# Ingredients
def ingr():
    

    return s