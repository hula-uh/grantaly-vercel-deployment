import { Plan, PlanAddon, planAddons, PriceType } from '../../../config'
import { Card } from '../multi-step/card/Card'
import styles from './FinishingUpCard.module.scss'

type Props = {
  plan: Plan
  addons: Set<PlanAddon>
  priceType: PriceType
  onChangePlanClick: () => void
}

export default function FinishingUpCard(
  { plan, addons, priceType, onChangePlanClick }: Props,
) {
  const isMonthly = priceType === 'monthly'
  const total = calcTotal(plan, addons, priceType)

  const selectedAddons = planAddons.filter(addon => addons.has(addon))

  return (
    <Card>
      <Card.Title>Finishing up</Card.Title>
      <Card.Description>
        Double-check everything looks OK before confirming.
      </Card.Description>
      <div className={styles.cardContent}>
        <div className={styles.summary}>
          <div className={styles.planSummary}>
            <p className={styles.name}>
              {`${plan.name} (${isMonthly ? 'Monthly' : 'Yearly'})`}
            </p>
            <button className={styles.changeBtn} onClick={onChangePlanClick}>
              Change
            </button>
            <p className={styles.price}>
              {getPriceMessage(
                plan.monthlyPrice,
                plan.yearlyPrice,
                priceType,
              )}
            </p>
          </div>

          {selectedAddons.length > 0
            && (
              <div className={styles.addonList}>
                {selectedAddons.map(addon => (
                  <p key={addon.id} className={styles.addon}>
                    <span className={styles.name}>{addon.name}</span>
                    <span className={styles.price}>
                      {'+'
                        + getPriceMessage(
                          addon.monthlyPrice,
                          addon.yearlyPrice,
                          priceType,
                        )}
                    </span>
                  </p>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className={styles.total}>
        <p className={styles.label}>
          {`Total (per ${isMonthly ? 'month' : 'year'})`}
        </p>
        <p className={styles.price}>{`$${total}/${isMonthly ? 'mo' : 'yr'}`}</p>
      </div>
    </Card>
  )
}

function getPriceMessage(
  monthlyPrice: number,
  yearlyPrice: number,
  priceType: PriceType,
) {
  if (priceType === 'monthly') {
    return `$${monthlyPrice}/mo`
  }

  return `$${yearlyPrice}/yr`
}

function calcTotal(plan: Plan, addons: Set<PlanAddon>, priceType: PriceType) {
  let total = 0
  if (priceType === 'monthly') {
    total += plan.monthlyPrice
    addons.forEach(addon => total += addon.monthlyPrice)
  } else {
    total += plan.yearlyPrice
    addons.forEach(addon => total += addon.yearlyPrice)
  }

  return total
}






















// import axios from 'axios';

// const uploadFile = async (file) => {
//   try {
//     // Step 1: Get presigned URL from the backend
//     const { data } = await axios.post('/api/generatePresignedUrl', {
//       fileName: file.name,
//       fileType: file.type,
//     });

//     const { presignedUrl, key } = data;

//     // Step 2: Upload file to S3 using the presigned URL
//     await axios.put(presignedUrl, file, {
//       headers: {
//         'Content-Type': file.type,
//       },
//     });

//     console.log('File uploaded successfully:', key);
//     return key; // This can be stored in the database to reference the file
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     throw error;
//   }
// };





// import { useState } from 'react';

// const Step3UploadForm = () => {
//   const [file, setFile] = useState(null);

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!file) return alert("Please select a file");

//     try {
//       const fileKey = await uploadFile(file);
//       console.log("Uploaded file key:", fileKey);
//       // Now, you can send fileKey to your backend to store the file reference in your database
//     } catch (error) {
//       console.error("File upload failed", error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
//       <button type="submit">Upload Document</button>
//     </form>
//   );
// };

