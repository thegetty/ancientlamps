# Ancient Lamps Starter Repo

This is the starting repo for the _Ancient Lamps in the J. Paul Getty Museum_
catalogue. The project files have been copied over from Thoughtbot's
[Proteus Middleman](https://github.com/thoughtbot/proteus-middleman)
project.

## Notes

### Object Data Structure

Most objects seem to be described in the following format:

```yaml
# Example Object

cat: 1
acc: 83.AQ.377.542
dimensions:
  l: 11.4
  w: 12.1
  h: 2.5
description: >
  Intact. Clay 5YR7/2 pinkish gray, thick slip 10YR7/3 very pale brown.
  Broad slightly concave basin; flat rim, folded upward and pinched at
  front to form an narrow open spout. Broad slightly convex base.
proveniance: Anatolia
type: 
 - Vessberg 1
parallels: >
  Vessberg 1953, nos. 115, 117, pl I.1; Deneauve 1969, p. 23, no. 1, pl. 17;
  Bailey BM I, Q 489, pl. 96; Oziol 1977, nos. 7-10, pl. 1; Kassab Tezgör and
  Sezer 1995, no. 14; Bussière 2000, p. 239, no. P1, pl. 1; Sussmann 2007, nos.
  1240, 1462.
date: Seventh century B.C. to Hellenistic

# Some objects also seem to have a discussion field as well, which looks to be
# a short annotated bibliography or notes section rather than an extended essay. 
# Is this true in all cases?
```

#### Questions

1. Can the `date` field be converted to a numeric value for all objects to facilitate
   sorting/filtering/comparison?
2. Will the `description` and `parallels` fields always work as plain text
   (do these fields require special characters or formatting beyond basic markdown?)
   In particular, will these areas ever need to contain figures or charts?
3. Are `dimensions` always given in centimeters?
4. Can the `type` field always be represented as a list of specific "keys" taken
   from a predetermined list of types so that objects could be sorted/filtered
   by this attribute? For this to work this field should be converted into an array.
5. Do any objects have attributes not present in the example above?


### Sort / Filter Functionality

Since there are so many objects in this catalogue, the user should have the ability
to sort/filter the collection by various criteria. Right now the following attributes
look they could be used in this way:

- **Proveniance**: Filter by named region
- **Type**: Filter by named type
- **Date**: Sort by date, filter by chronological period (should still be represented 
  numerically)
- **Material?** This is not explicitly broken out as an object attribute, but seems to 
  typically appear at the beginning of the `description` section. Most of the lamps
  are clay (does it make sense to filter by type of clay?); but there are also some 
  metallic lamps at the end of the catalogue.
  
### Concordance

In addition to the ability to sort/filter by some or all of the above categories, the
book has space allocated for a **Concordance** section. A digital equivalent of this
would allow users to easily translate accession numbers into cat numbers and vice versa;
perhaps this could be incorporated into the search functionality of the site?
